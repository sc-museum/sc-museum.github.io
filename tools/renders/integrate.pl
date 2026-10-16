#!/usr/bin/perl
# Puts the room renderings into the museum: assets/renders/, data/images.json,
# a figure with hotspots under each room's heading, and a gallery in the lobby.
# usage: perl integrate.pl <render-out-dir> <thumb-dir>   (run from the repo root)
use strict; use warnings; use File::Copy;
my ($out, $thumbs) = @ARGV;
my %CRLF;
sub slurp { my $p = shift; open my $f, '<:raw', $p or die "$p: $!"; local $/; my $t = <$f>; $CRLF{$p} = 1 if $t =~ /\r\n/; $t =~ s/\r\n/\n/g; $t }
sub spew { my ($p, $t) = @_; $t =~ s/\n/\r\n/g if $CRLF{$p}; open my $f, '>:raw', $p or die "$p: $!"; print $f $t; }
sub esc { my $s = shift; $s =~ s/&(?![a-z]+;|#\d+;|#x[0-9a-f]+;)/&amp;/gi; $s =~ s/"/&quot;/g; $s =~ s/</&lt;/g; $s }
sub json_field { my ($j, $k) = @_; $j =~ /"$k":"((?:[^"\\]|\\.)*)"/ ? $1 : '' }

my %file = map { m{rooms/\d+-(.+)\.html$} ? ($1 => $_) : () } glob 'rooms/*.html';
$file{'people'} = 'rooms/12-people.html'; $file{'give'} = 'rooms/13-give.html';
my %id = (  # section id => render name (they match except where noted)
  map { $_ => $_ } qw(auditorium camp-gordon command-gallery hello-girls combat-camera fireside donor-spotlight people give timeline news magazine civil-war satellites weather fort-gordon wireless wired codes desert-storm));
my %roomfile;
for my $f (glob 'rooms/*.html'){ my $t = slurp($f); $roomfile{$1} = $f if $t =~ /<section class="room[^"]*" id="room-([^"]+)"/; }

# what each drawing shows, for its alt text
my %desc = (
  'auditorium'      => 'a theater with rows of red seats facing a screen that reads Now Showing',
  'camp-gordon'     => 'a brick-walled gallery of First World War photographs, with a line of sandbags and display cases',
  'command-gallery' => 'a gallery of Signal Command patches, with unit photographs and a display board',
  'hello-girls'     => 'a gallery of 1918 photographs of the Signal Corps telephone operators, with a period switchboard and display cases',
  'combat-camera'   => 'a gallery of Signal Corps photographs, with an Oscars wall, the two Academy Award statuettes for Prelude to War and Seeds of Destiny in lit cases, and a newsreel camera on a tripod',
  'fireside'        => 'a fireside room with armchairs on a rug, a bookcase, and the Heritage magazine above the fireplace',
  'donor-spotlight' => 'a donor wall with a gold plaque for each tier of the Campaign Circle, beside portraits of Maj. Gen. Peter Kind and a frame for Maj. Gen. Patricia Frost',
  'people'          => 'an honor roll wall of portraits, with Hall of Fame pictures and display cases',
  'give'            => 'a campaign room with wartime posters, a fundraising panel, and pictures of the planned building',
  'timeline'        => 'a timeline wall with the Society\'s three seals for 2019, 2021 and 2024',
  'news'            => 'a reading room with Heritage covers on the wall, a news screen and a magazine rack',
  'magazine'        => 'a reading room with Heritage pages on the walls and reading tables',
  'civil-war'       => 'a brick-walled gallery of Civil War signal photographs, with a timber signal tower and wig-wag flags',
  'satellites'      => 'a gallery of satellite photographs beside a glass wall, with a ground-terminal dish and a satellite hanging overhead',
  'weather'         => 'a gallery of Army weather photographs beside a glass wall, with an instrument shelter, an anemometer and a theodolite',
  'fort-gordon'     => 'a brick-walled gallery of Fort Gordon history, with a post gate sign and a model of USS Augusta',
  'wireless'        => 'a gallery of Army radio photographs, with a lattice radio mast and radios in display cases',
  'wired'           => 'a gallery of wire and telephone photographs, with a telegraph pole, a cable reel and field telephones',
  'codes'           => 'a dark gallery with a large cipher disk, a photograph of William Friedman, and cipher machines under glass',
  'desert-storm'    => 'a gallery of Desert Storm maps, with a tent, a shelter and a satellite dish on sand',
);

# bio names from museum.js, for the honor roll hotspots
my $js = slurp('js/museum.js'); my %bio;
while ($js =~ /'(\w+)':\s*\{\s*name:\s*'([^']+)'/g){ $bio{$1} = $2; }

mkdir 'assets/renders'; mkdir 'assets/renders/thumbs';
my $imgs = slurp('data/images.json');
my %reg = $imgs =~ /"([^"]+)":\s*"([^"]+)"/g;

my @gallery;
for my $r (sort keys %id){
  my $sec = $id{$r}; my $f = $roomfile{$sec} or die "no room file for $sec";
  copy("$out/$r.jpg", "assets/renders/$r.jpg") or die "copy $r: $!";
  copy("$thumbs/$r.jpg", "assets/renders/thumbs/$r.jpg") or die "thumb $r: $!";
  (my $key = "render_$r") =~ tr/-/_/; $reg{$key} = "assets/renders/$r.jpg";
  my $room = slurp($f);
  $room =~ s{\n    <figure class="render-fig">.*?</figure>\n}{}s;  # idempotent
  my ($title) = $room =~ m{<h1 class="room-title">(.*?)</h1>}s;
  # alt text for every picture this room already shows
  my %alt;
  while ($room =~ /<img\b([^>]*)>/g){ my $a = $1; my ($s) = $a =~ /\bsrc="([^"]+)"/; my ($t) = $a =~ /\balt="([^"]*)"/; $alt{$s} //= $t if $s && defined $t && length $t; }
  my $j = slurp("$out/$r.json"); my @spots;
  while ($j =~ /\{"src":"([^"]+)","alt":"((?:[^"\\]|\\.)*)","l":([\d.]+),"t":([\d.]+),"w":([\d.]+),"h":([\d.]+)\}/g){
    my ($src, $a0, $l, $t, $w, $h) = ($1, $2, $3, $4, $5, $6);
    my $style = sprintf 'left:%s%%;top:%s%%;width:%s%%;height:%s%%', $l, $t, $w, $h;
    if ($src =~ m{assets/bio_(\w+)\.} && $bio{$1}){
      push @spots, qq{        <button type="button" class="render-hot" style="$style" data-bio="$1" aria-label="${\ esc($bio{$1})}"><span>${\ esc($bio{$1})}</span></button>\n};
    } else {
      my $lab = $alt{$src} // $a0; $lab =~ s/\s+/ /g;
      push @spots, qq{        <button type="button" class="render-hot" style="$style" data-render-src="$src" aria-label="${\ esc($lab)}"><span>${\ esc($lab)}</span></button>\n};
    }
  }
  my $fig = qq{\n    <figure class="render-fig">\n      <div class="render-stage">\n        <img loading="lazy" decoding="async" src="assets/renders/$r.jpg" data-img="$key" width="1600" height="900" alt="Concept drawing of this room in the planned museum: ${\ esc($desc{$r})}">\n}
    . join('', @spots)
    . qq{      </div>\n      <figcaption><b>This room, as it could look in the museum.</b> A concept drawing made for the virtual museum in the style of the architect's renderings, with this room's own pictures on the walls. It is not part of the architect's design. Select a framed picture to find it in this room.</figcaption>\n    </figure>\n};
  $room =~ s{(<div class="room-head">.*?<p class="room-dek">.*?</p>\s*</div>\n)}{$1$fig}s or die "no room-head in $f";
  spew($f, $room);
  push @gallery, [$sec, $title, $r];
  printf "%-16s %d hotspots\n", $r, scalar @spots;
}

# the Cyber Story already has a drawing: the architect's exhibit hall
{
  my $f = $roomfile{'cyber-story'}; my $room = slurp($f);
  $room =~ s{\n    <figure class="render-fig">.*?</figure>\n}{}s;
  my $fig = qq{\n    <figure class="render-fig">\n      <div class="render-stage">\n        <img loading="lazy" decoding="async" src="assets/aviation_render.jpg" data-img="aviation_render" alt="Rendering of the glass exhibit hall with a biplane overhead and Cyber and Technology exhibit walls">\n      </div>\n      <figcaption><b>Where the Cyber exhibit is planned.</b> The architect's rendering of the curved exhibit hall, with the Cyber and Technology walls under the biplane. The finished museum may differ.</figcaption>\n    </figure>\n};
  $room =~ s{(<div class="room-head">.*?<p class="room-dek">.*?</p>\s*</div>\n)}{$1$fig}s or die "no room-head in $f";
  spew($f, $room);
}

# a lobby gallery of every room's drawing
{
  my $f = $roomfile{'lobby'}; my $room = slurp($f);
  $room =~ s{\n    <div class="section" id="rooms-drawn">.*?<!-- /rooms-drawn -->\n}{}s;
  my @all = ([ 'signal-story', 'The Signal Story', undef, 'assets/signal_gallery_render.jpg', 'Architect' ], [ 'aviation', 'The Aviation Annex', undef, 'assets/aviation_render.jpg', 'Architect' ], [ 'cyber-story', 'The Cyber Story', undef, 'assets/aviation_render.jpg', 'Architect' ]);
  # floor order, as the rooms appear in the building
  my %order; my $i = 0; $order{$_} = $i++ for map { m{rooms/\d+-(.+)\.html$}; my $t = slurp($_); $t =~ /id="room-([^"]+)"/ ? $1 : () } sort glob 'rooms/*.html';
  push @all, map { [ $_->[0], $_->[1], $_->[2], "assets/renders/thumbs/$_->[2].jpg", 'Concept' ] } @gallery;
  @all = sort { $order{$a->[0]} <=> $order{$b->[0]} } @all;
  my $cards = join '', map {
    my ($sec, $t, undef, $src, $kind) = @$_; (my $tt = $t) =~ s/<[^>]+>//g;
    qq{        <button type="button" class="drawn-card" data-goto="$sec"><img loading="lazy" decoding="async" src="$src" alt="" width="480" height="270"><span class="drawn-k">$kind</span><span class="drawn-t">$tt</span></button>\n}
  } @all;
  my $sec = qq{\n    <div class="section" id="rooms-drawn">\n      <h3>Every room, drawn</h3>\n      <p class="lede">How each room of this virtual museum could look in the building to come. The drawings marked Architect are from the architect's renderings; the rest are concept drawings made for the virtual museum in the same style, with each room's own pictures on the walls. Select one to walk in.</p>\n      <div class="drawn-grid">\n$cards      </div>\n    </div>\n    <!-- /rooms-drawn -->\n};
  $room =~ s{(\n    <div class="section" id="map-section")}{$sec$1} or die "no map-section in lobby";
  spew($f, $room);
}

# images.json: add the new keys in sorted position, keeping the file's line endings
my ($nl) = $imgs =~ /(\r?\n)/;
for my $k (sort grep { /^render_/ } keys %reg){
  next if $imgs =~ /"$k"/;
  my @lines = split /(?<=\n)/, $imgs;
  my $new = qq{  "$k": "$reg{$k}",$nl};
  my ($at) = grep { $lines[$_] =~ /^\s*"([^"]+)"/ && $1 gt $k } 0..$#lines;
  splice @lines, $at, 0, $new; $imgs = join "", @lines;
}
spew("data/images.json", $imgs);
