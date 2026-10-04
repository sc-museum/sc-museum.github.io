#!/usr/bin/perl
# Builds a photo album page for a unit's Ready Room.
#
#   perl tools/gen-album.pl lineage/photos/0001scbde/2010-troka "Title" "Date line" "Note"
#
# The album folder holds web-sized photos (*.jpg) and a thumbs/ folder with the
# same file names (tools/heritage/thumbs.ps1-style resizing; see tools/README.md).
# Writes index.html in the album folder. The unit page is taken from the path
# (lineage/photos/<unit>/<album>).
use strict; use warnings; use utf8;
binmode STDOUT, ':utf8';

my ($dir, $title, $dateline, $note) = @ARGV;
die "usage: gen-album.pl <album dir> <title> [date line] [note]\n" unless $dir && $title;
$dir =~ s{/+$}{};
my ($unit) = $dir =~ m{lineage/photos/([^/]+)/[^/]+$} or die "album must be under lineage/photos/<unit>/<album>\n";
$dateline //= ''; $note //= '';
utf8::decode($_) for $title, $dateline, $note;

sub esc { my $s = shift; $s =~ s/&/&amp;/g; $s =~ s/</&lt;/g; $s =~ s/>/&gt;/g; $s =~ s/"/&quot;/g; $s }

opendir my $dh, $dir or die "$dir: $!";
my @photos = sort grep { /\.jpe?g$/i && -f "$dir/thumbs/$_" } readdir $dh;
closedir $dh;
die "no photos with thumbnails in $dir\n" unless @photos;

# optional captions.tsv in the album folder: file<TAB>caption, one line per photo
my %cap;
if (open my $c, '<:encoding(UTF-8)', "$dir/captions.tsv") {
  while (<$c>) { chomp; s/\r$//; my ($f, $t) = split /\t/, $_, 2; $cap{$f} = $t if defined $t && length $t; }
  close $c;
}

# unit name from the unit's lineage page
my $unitname = $unit;
if (open my $u, '<:encoding(UTF-8)', "$dir/../../../$unit.htm") {
  local $/; my $h = <$u>; close $u;
  ($unitname) = $h =~ m{<h1>(.*?)</h1>}s if $h =~ m{<h1>}; $unitname =~ s/<[^>]+>//g;
}

my $n = scalar @photos;
my $tiles = join "\n", map {
  my $i = $_; my $f = $photos[$i];
  my $c = $cap{$f} // '';
  my $alt = length $c ? "$c (photo " . ($i + 1) . " of $n)" : "$title, photo " . ($i + 1) . " of $n";
  sprintf '      <a class="al-tile" href="%s" data-i="%d" data-cap="%s"%s><img src="thumbs/%s" loading="lazy" decoding="async" alt="%s"></a>',
    esc($f), $i, esc($c), (length $c ? ' title="' . esc($c) . '"' : ''), esc($f), esc($alt)
} 0 .. $#photos;

my $page = <<"HTML";
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>@{[ esc($title) ]} &#8212; @{[ esc($unitname) ]}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght\@0,400;0,600;1,400&family=IBM+Plex+Sans:wght\@400;600&family=IBM+Plex+Mono:wght\@400;500&display=swap" rel="stylesheet">
<link href="../../../lineage.css" rel="stylesheet">
</head>
<body>
  <header class="bar">
    <div class="inner">
      <a class="brand" href="../../../../index.html">Signal &amp; Cyber Corps Museum Society</a>
      <a class="back" href="../../../$unit.htm">&#8592; @{[ esc($unitname) ]}</a>
    </div>
  </header>
  <div class="wrap album">
    <div class="kicker">Unit Ready Room &#183; Photo album</div>
    <h1>@{[ esc($title) ]}</h1>
    <p class="asof">@{[ esc(join ' · ', grep { length } $dateline, "$n photographs") ]}</p>
@{[ length $note ? '    <p class="al-note">' . esc($note) . "</p>\n" : '' ]}    <div class="al-grid">
$tiles
    </div>
    <footer class="src">From the Society's collection. Select any photograph to see it full size; use the arrow keys to move through the album. <a href="../../../$unit.htm">Back to the unit's lineage and Ready Room</a>.</footer>
  </div>
  <div class="al-box" id="al-box" role="dialog" aria-modal="true" aria-label="Photograph" hidden>
    <div class="al-bar"><span id="al-count"></span>
      <button type="button" id="al-prev" aria-label="Previous photograph">&#8249;</button>
      <button type="button" id="al-next" aria-label="Next photograph">&#8250;</button>
      <a id="al-orig" href="#" target="_blank" rel="noopener" aria-label="Open this photograph by itself">&#8599;</a>
      <button type="button" id="al-close" aria-label="Close">&#215;</button>
    </div>
    <div class="al-stage"><img id="al-img" alt=""></div>
    <div class="al-cap" id="al-cap"></div>
  </div>
<script>
(function(){
  var tiles = [].slice.call(document.querySelectorAll('.al-tile'));
  var box = document.getElementById('al-box'), img = document.getElementById('al-img');
  var count = document.getElementById('al-count'), orig = document.getElementById('al-orig');
  var at = 0, back = null;
  function show(i){
    at = (i + tiles.length) % tiles.length;
    var t = tiles[at];
    img.src = t.getAttribute('href'); img.alt = t.querySelector('img').alt;
    orig.href = t.getAttribute('href');
    count.textContent = (at + 1) + ' / ' + tiles.length;
    document.getElementById('al-cap').textContent = t.getAttribute('data-cap') || '';
    if (box.hidden){ back = document.activeElement; box.hidden = false; document.getElementById('al-close').focus(); }
  }
  function hide(){ box.hidden = true; img.removeAttribute('src'); if (back) back.focus(); }
  tiles.forEach(function(t, i){ t.addEventListener('click', function(e){ e.preventDefault(); show(i); }); });
  document.getElementById('al-prev').onclick = function(){ show(at - 1); };
  document.getElementById('al-next').onclick = function(){ show(at + 1); };
  document.getElementById('al-close').onclick = hide;
  box.addEventListener('click', function(e){ if (e.target === box || e.target.className === 'al-stage') hide(); });
  document.addEventListener('keydown', function(e){
    if (box.hidden) return;
    if (e.key === 'Escape') hide();
    else if (e.key === 'ArrowLeft') show(at - 1);
    else if (e.key === 'ArrowRight') show(at + 1);
  });
})();
</script>
</body>
</html>
HTML

open my $out, '>:encoding(UTF-8)', "$dir/index.html" or die "$dir/index.html: $!";
print $out $page; close $out;
print "wrote $dir/index.html ($n photos)\n";
