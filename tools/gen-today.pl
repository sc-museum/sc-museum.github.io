#!/usr/bin/perl
# Builds "Today in Signal history": today/index.html, feed.xml and data/today-log.json.
#
#   perl tools/gen-today.pl            # today's date in America/New_York
#   perl tools/gen-today.pl 2026-11-01 # a given date (for testing)
#
# Stories come from the This Month in History calendar in rooms/02-auditorium.html
# (<article class="co" data-month="Nov" data-day="1">). On a day with no anniversary
# it uses the nearest story within a week that has not run in the last 14 days.
# The GitHub workflow .github/workflows/today.yml runs this every morning, so the
# feed gives social-media auto-posters one new item a day.
use strict; use warnings; use utf8;
use POSIX qw(strftime mktime);
use JSON::PP;
binmode STDOUT, ':utf8';

my $SITE = 'https://sc-museum.github.io/';
my %MON = (Jan=>1,Feb=>2,Mar=>3,Apr=>4,May=>5,Jun=>6,Jul=>7,Aug=>8,Sep=>9,Oct=>10,Nov=>11,Dec=>12);
my @MNAME = qw(x January February March April May June July August September October November December);

sub slurp { my $p = shift; open my $f, '<:encoding(UTF-8)', $p or die "$p: $!"; local $/; my $t = <$f>; $t =~ s/\r//g; return $t; }
sub spew { my ($p, $t) = @_; open my $f, '>:encoding(UTF-8)', $p or die "$p: $!"; print $f $t; close $f; }
sub strip { my $t = shift; $t =~ s/<[^>]+>//g; $t =~ s/&amp;/&/g; $t =~ s/&#x27;|&#39;/'/g; $t =~ s/&quot;/"/g; $t =~ s/&lt;/</g; $t =~ s/&gt;/>/g; $t =~ s/&nbsp;/ /g; $t =~ s/\s+/ /g; $t =~ s/^ | $//g; return $t; }
sub esc { my $t = shift // ''; $t =~ s/&/&amp;/g; $t =~ s/</&lt;/g; $t =~ s/>/&gt;/g; $t =~ s/"/&quot;/g; return $t; }

# ---- the date ----
my ($Y, $M, $D);
if (@ARGV && $ARGV[0] =~ /^(\d{4})-(\d{2})-(\d{2})$/) { ($Y, $M, $D) = ($1, $2 + 0, $3 + 0); }
else { local $ENV{TZ} = 'America/New_York'; POSIX::tzset(); my @t = localtime; ($Y, $M, $D) = ($t[5] + 1900, $t[4] + 1, $t[3]); }
my $iso = sprintf '%04d-%02d-%02d', $Y, $M, $D;
sub doy { my ($m, $d) = @_; return (strftime('%j', 0, 0, 12, $d, $m - 1, 101) + 0); } # day of year in a non-leap year
my $today = doy($M, $D);

# ---- the stories ----
my $aud = slurp('rooms/02-auditorium.html');
my @S;
while ($aud =~ m{<article class="co" data-month="(\w+)" data-day="(\d+)">(.*?)</article>}sg) {
  my ($mo, $dy, $body) = ($MON{$1}, $2 + 0, $3);
  my ($yr) = $body =~ m{<em>(\d{3,4})</em>};
  my ($tag) = $body =~ m{<span class="tag">(.*?)</span>}s;
  my ($title) = $body =~ m{<h4>(.*?)</h4>}s;
  my ($text) = $body =~ m{<p>(.*?)</p>}s;
  my ($goto) = $body =~ m{data-goto="([\w-]+)"};
  next unless $mo && $title && $text;
  push @S, { month => $mo, day => $dy, year => $yr, tag => strip($tag // ''), title => strip($title), text => strip($text), goto => $goto // 'auditorium',
             key => sprintf('%02d-%02d-%s', $mo, $dy, $yr // ''), doy => doy($mo, $dy) };
}
die "no stories found\n" unless @S;

# ---- the log of what has run ----
my $logf = 'data/today-log.json';
my $log = -f $logf ? decode_json(do { open my $f, '<:raw', $logf; local $/; <$f> }) : [];
@$log = grep { $_->{date} ne $iso } @$log;            # re-running a day replaces it
my %recent; for my $e (@$log) { $recent{$e->{key}} = 1 if (mktime(0,0,12,substr($iso,8,2),substr($iso,5,2)-1,substr($iso,0,4)-1900) - mktime(0,0,12,substr($e->{date},8,2),substr($e->{date},5,2)-1,substr($e->{date},0,4)-1900)) < 14*86400; }

# ---- pick ----
sub dist { my ($a, $b) = @_; my $d = abs($a - $b); return $d > 182 ? 365 - $d : $d; }
my @exact = grep { $_->{month} == $M && $_->{day} == $D } @S;
my ($pick, $kind);
if (@exact) { ($pick) = sort { ($recent{$a->{key}} ? 1 : 0) <=> ($recent{$b->{key}} ? 1 : 0) || ($a->{year} // 0) <=> ($b->{year} // 0) } @exact; $kind = 'day'; }
else {
  my @near = sort { dist($a->{doy}, $today) <=> dist($b->{doy}, $today) || $a->{doy} <=> $b->{doy} } grep { !$recent{$_->{key}} } @S;
  @near = sort { dist($a->{doy}, $today) <=> dist($b->{doy}, $today) } @S unless @near;
  $pick = $near[0];
  $kind = dist($pick->{doy}, $today) <= 7 ? 'week' : 'calendar';
}
my $when = "$MNAME[$pick->{month}] $pick->{day}, $pick->{year}";
my $kick = $kind eq 'day' ? "On this day in Signal history" : $kind eq 'week' ? "This week in Signal history" : "From the Signal history calendar";
my $headline = $kind eq 'day' ? "On this day in $pick->{year}: $pick->{title}" : "$when: $pick->{title}";
my $room = $SITE . '#' . $pick->{goto};

# a picture from the related room, for the link preview
my $img = $SITE . 'assets/social-card.jpg';
my ($rf) = glob("rooms/*.html");
for my $f (glob 'rooms/*.html') {
  my $t = slurp($f);
  next unless $t =~ /id="room-\Q$pick->{goto}\E"/;
  if ($t =~ m{class="ax-photo[^"]*"[^>]*>\s*<a [^>]*>\s*<img [^>]*src="([^"]+)"}s || $t =~ m{<img [^>]*src="(assets/(?:nara|archives|annex)/[^"]+)"}) { $img = $SITE . $1; }
  last;
}

unshift @$log, { date => $iso, key => $pick->{key}, kind => $kind, headline => $headline, text => $pick->{text}, room => $room, image => $img, tag => $pick->{tag} };
splice(@$log, 60) if @$log > 60;
spew($logf, JSON::PP->new->canonical->pretty->encode($log));

# ---- today/index.html ----
my $desc = $pick->{text};
my $page = <<"HTML";
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>@{[esc($headline)]} · Signal &amp; Cyber Corps Museum Society</title>
<meta name="description" content="@{[esc($desc)]}">
<link rel="canonical" href="${SITE}today/">
<link rel="alternate" type="application/rss+xml" title="Today in Signal history" href="${SITE}feed.xml">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Signal &amp; Cyber Corps Museum Society">
<meta property="og:title" content="@{[esc($headline)]}">
<meta property="og:description" content="@{[esc($desc)]}">
<meta property="og:url" content="${SITE}today/">
<meta property="og:image" content="@{[esc($img)]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="@{[esc($headline)]}">
<meta name="twitter:description" content="@{[esc($desc)]}">
<meta name="twitter:image" content="@{[esc($img)]}">
<meta name="theme-color" content="#0d1f16">
<link rel="icon" type="image/png" href="../seal.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Spectral:wght@600;700&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono&display=swap" rel="stylesheet">
<style>
:root{--ink:#0d1f16;--panel:#132a1e;--hair:#2a4a37;--gold:#c9a227;--gold-b:#e0bc4a;--paper:#ece2c6;--white:#f4f3ee;--muted:#a9bdb0;--crimson:#a53344}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--white);font:16px/1.6 "IBM Plex Sans",-apple-system,sans-serif}
.wrap{max-width:720px;margin:0 auto;padding:40px max(18px,env(safe-area-inset-left)) 60px}
.top{display:flex;align-items:center;gap:12px;color:var(--paper);text-decoration:none;font:600 15px Spectral,Georgia,serif}
.top img{width:44px;height:44px}
.k{font:12px "IBM Plex Mono",monospace;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin:40px 0 8px}
h1{font:700 clamp(28px,5vw,40px)/1.15 Spectral,Georgia,serif;margin:0 0 6px;text-wrap:balance}
.when{font:13px "IBM Plex Mono",monospace;color:var(--muted);margin:0 0 18px}
.pic{margin:0 0 20px;border:1px solid var(--hair);background:#000}
.pic img{display:block;width:100%;height:auto}
p.text{font-size:18px;color:var(--paper);margin:0 0 24px}
.go{display:inline-block;background:var(--gold);color:var(--ink);font-weight:600;padding:12px 20px;border-radius:2px;text-decoration:none;margin:0 8px 10px 0}
.go.alt{background:transparent;color:var(--gold-b);border:1px solid var(--gold)}
.give{margin-top:30px;padding:16px 18px;border:1px solid var(--hair);border-left:3px solid var(--crimson);background:var(--panel);font-size:15px}
.give a{color:var(--gold-b)}
.prev{margin-top:34px;border-top:1px solid var(--hair);padding-top:16px}
.prev h2{font:600 18px Spectral,Georgia,serif;color:var(--paper);margin:0 0 8px}
.prev ul{list-style:none;margin:0;padding:0}
.prev li{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14.5px}
.prev li a{color:var(--white)}
.prev li span{display:block;font:12px "IBM Plex Mono",monospace;color:var(--muted)}
.foot{margin-top:30px;font-size:13px;color:var(--muted)}
.foot a{color:var(--gold-b)}
</style>
</head>
<body>
<div class="wrap">
<a class="top" href="../"><img src="../assets/seal-mark.png" alt="">Signal &amp; Cyber Corps Museum Society · Virtual Museum</a>
<p class="k">@{[esc($kick)]}</p>
<h1>@{[esc($pick->{title})]}</h1>
<p class="when">@{[esc($when)]}@{[ $pick->{tag} ? ' · ' . esc($pick->{tag}) : '' ]}</p>
<figure class="pic"><img src="@{[esc($img)]}" alt=""></figure>
<p class="text">@{[esc($pick->{text})]}</p>
<a class="go" href="@{[esc($room)]}">See it in the museum</a><a class="go alt" href="${SITE}#auditorium">The whole calendar</a>
<div class="give">The Signal Corps Museum's collection is in storage until a new museum is built outside the gates of Fort Gordon. <a href="${SITE}#give">Help bring it home</a>, or <a href="${SITE}#dispatch">get one story a month by email</a>.</div>
<div class="prev"><h2>Recent days</h2><ul>
HTML
for my $e (@$log[1 .. ($#$log < 7 ? $#$log : 7)]) { next unless $e; $page .= '<li><a href="' . esc($e->{room}) . '">' . esc($e->{headline}) . '</a><span>' . esc($e->{date}) . "</span></li>\n"; }
$page .= <<"HTML";
</ul></div>
<p class="foot">A new story every morning. Follow along with the <a href="${SITE}feed.xml">RSS feed</a>, or visit <a href="${SITE}">the virtual museum</a>.</p>
</div>
</body>
</html>
HTML
my $dayPage = $page; $dayPage =~ s{<link rel="canonical" href="${SITE}today/">}{<link rel="canonical" href="${SITE}today/$iso.html">}; $dayPage =~ s{<meta property="og:url" content="${SITE}today/">}{<meta property="og:url" content="${SITE}today/$iso.html">};
mkdir 'today' unless -d 'today';
spew('today/index.html', $page);
spew("today/$iso.html", $dayPage);

# ---- feed.xml ----
sub rfc822 { my $d = shift; my ($y, $m, $dd) = split /-/, $d; return strftime('%a, %d %b %Y 10:00:00 +0000', 0, 0, 10, $dd, $m - 1, $y - 1900); }
my $rss = qq{<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n<channel>\n<title>Today in Signal history · Signal &amp; Cyber Corps Museum Society</title>\n<link>${SITE}today/</link>\n<atom:link href="${SITE}feed.xml" rel="self" type="application/rss+xml"/>\n<description>A story a day from the history of the U.S. Army Signal Corps and Cyber Corps, from the Signal &amp; Cyber Corps Museum Society's virtual museum.</description>\n<language>en-us</language>\n<lastBuildDate>@{[rfc822($iso)]}</lastBuildDate>\n};
for my $e (@$log[0 .. ($#$log < 29 ? $#$log : 29)]) {
  my $link = "${SITE}today/$e->{date}.html";
  $rss .= "<item>\n<title>" . esc($e->{headline}) . "</title>\n<link>" . esc($link) . "</link>\n<guid isPermaLink=\"false\">sc-museum-today-$e->{date}</guid>\n<pubDate>" . rfc822($e->{date}) . "</pubDate>\n<description>" . esc($e->{text} . ' #SignalCorps #ArmyHistory') . "</description>\n<media:content url=\"" . esc($e->{image}) . "\" medium=\"image\"/>\n<enclosure url=\"" . esc($e->{image}) . "\" type=\"image/jpeg\" length=\"0\"/>\n</item>\n";
}
$rss .= "</channel>\n</rss>\n";
spew('feed.xml', $rss);
printf "%s: %s (%s) -> %s\n", $iso, $headline, $kind, $room;
