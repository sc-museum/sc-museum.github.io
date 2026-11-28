#!/usr/bin/perl
# Gives every film page in stories/ what search engines and social sites need when the film is
# found or shared on its own: a description, a canonical address, a sharing card (Open Graph and
# X/Twitter) with a picture from the film, and the site's analytics script.
#
#   perl tools/gen-film-meta.pl      update stories/*.html in place (safe to run again)
#
# The block sits between <!-- film-meta --> and <!-- /film-meta --> in each page's <head>.
use strict; use warnings;
use FindBin;
chdir "$FindBin::Bin/.." or die "cannot cd: $!";
my $SITE = 'https://sc-museum.github.io';

sub esc { my $s = shift; $s =~ s/&(?!amp;|lt;|gt;|quot;|#)/&amp;/g; $s =~ s/"/&quot;/g; $s =~ s/</&lt;/g; return $s }

for my $f (sort glob 'stories/*.html') {
  open my $h, '<:raw', $f or die "$f: $!"; local $/; my $s = <$h>; close $h;
  my ($title) = $s =~ m{<title>(.*?)</title>}s or next;
  $title =~ s/\s*·\s*Signal &amp; Cyber Corps Museum Society\s*$//;
  my $plain = $title; $plain =~ s/&amp;/&/g;
  my ($name, $sub) = split /:\s*/, $plain, 2;
  # the annex the film belongs to, from its back link
  my ($annex) = $s =~ m{←\s*([^,<]+?),\s*Signal &amp; Cyber Corps Museum Society}s;
  $annex = 'virtual museum' unless $annex; $annex =~ s/&amp;/&/g; $annex =~ s/\s+/ /g;
  # the first archive picture the film uses, else the museum's social card
  my ($img) = $s =~ m{"\.\./(assets/(?:archives|nara|annex|aviation)/[^"]+\.jpg)"};
  $img = $img ? "$SITE/$img" : "$SITE/assets/social-card.jpg";
  my $desc = "A narrated, animated film" . ($sub ? " about $sub" : '') .
             " from the $annex of the Signal & Cyber Corps Museum Society's virtual museum. Free to watch.";
  my $url = "$SITE/$f";
  my $block = join "\n",
    '<!-- film-meta -->',
    '<meta name="description" content="' . esc($desc) . '">',
    '<link rel="canonical" href="' . $url . '">',
    '<meta property="og:type" content="video.other">',
    '<meta property="og:site_name" content="Signal &amp; Cyber Corps Museum Society">',
    '<meta property="og:title" content="' . esc($plain) . '">',
    '<meta property="og:description" content="' . esc($desc) . '">',
    '<meta property="og:url" content="' . $url . '">',
    '<meta property="og:image" content="' . $img . '">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' . esc($plain) . '">',
    '<meta name="twitter:description" content="' . esc($desc) . '">',
    '<meta name="twitter:image" content="' . $img . '">',
    '<!-- /film-meta -->', '';
  if ($s =~ m{<!-- film-meta -->.*?<!-- /film-meta -->\r?\n}s) { $s =~ s{<!-- film-meta -->.*?<!-- /film-meta -->\r?\n}{$block}s }
  else { $s =~ s{(</title>\r?\n)}{$1$block} or die "$f: no </title>" }
  # analytics (it does nothing when the film is embedded in a museum room)
  $s =~ s{(</body>)}{<script src="../js/analytics.js"></script>\n$1} unless $s =~ m{js/analytics\.js};
  open $h, '>:raw', $f or die; print $h $s; close $h;
  print "$f\n";
}
