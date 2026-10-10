#!/usr/bin/perl
# Run from the repo root:  perl tools/apply-annexes.pl
# Wires the Civil War and Satellite annexes into src/index.html and js/museum.js,
# then rebuilds index.html. Safe to run twice.
use strict; use warnings;
sub slurp { open my $f,'<:raw',$_[0] or die "Cannot open $_[0]: $!\n"; local $/; my $t=<$f>; close $f; $t }
sub spit  { open my $f,'>:raw',$_[0] or die "Cannot write $_[0]: $!\n"; print $f $_[1]; close $f }
for my $p (qw(rooms/90-civil-war.html rooms/91-satellites.html css/signal-annexes.css js/map-layout.js js/signal-yard.js)) {
  die "MISSING FILE: $p  (upload the package files first)\n" unless -f $p;
}
my $nl;
# ---- src/index.html ----
my $h = slurp('src/index.html'); $nl = $h =~ /\r\n/ ? "\r\n" : "\n";
if ($h !~ /signal-annexes\.css/) {
  $h =~ s{(<!--\s*\@css\s+css/museum\.css\s*-->)}{$1$nl<!-- \@css css/signal-annexes.css -->} or die "No \@css css/museum.css placeholder found\n";
}
if ($h !~ /map-layout\.js/) {
  $h =~ s{(<!--\s*\@js\s+js/museum\.js\s*-->)}{<!-- \@js js/map-layout.js -->$nl$1$nl<!-- \@js js/signal-yard.js -->} or die "No \@js js/museum.js placeholder found\n";
}
if ($h !~ /data-goto="civil-war"/) {
  $h =~ s{(<button[^>]*data-goto="aviation"[^>]*>.*?</button>)}{$1$nl      <button data-goto="civil-war">Civil War Annex</button>$nl      <button data-goto="satellites">Satellite Annex</button>}s
    or die "No aviation nav button found to anchor the new buttons\n";
}
spit('src/index.html',$h);
# ---- js/museum.js ----
my $j = slurp('js/museum.js'); $nl = $j =~ /\r\n/ ? "\r\n" : "\n";
if ($j !~ /go:\s*'civil-war'/) {
  my $new = "  {n:'00', t:'Civil War Signal Annex', d:'Wig-wag flags, torches, Morse and the telegraph, plus games to try the code.', go:'civil-war'},$nl".
            "  {n:'00', t:'Satellite Annex', d:'From a radar echo off the Moon to satellite training at Fort Gordon.', go:'satellites'},$nl";
  # civil war after The Signal Story; satellites after the Aviation Annex; fall back to before map
  my $cw = (split /$nl/,$new)[0].$nl; my $sat = (split /$nl/,$new)[1].$nl;
  my $ok = 0;
  $ok++ if $j =~ s{(\{[^\n]*go:\s*'signal-story'[^\n]*\},?[ \t]*\r?\n)}{$1$cw};
  $ok++ if $j =~ s{(\{[^\n]*go:\s*'aviation'[^\n]*\},?[ \t]*\r?\n)}{$1$sat};
  die "Could not find signal-story/aviation DIRECTORY lines to anchor entries\n" unless $ok==2;
  # renumber n:'NN' sequentially inside the DIRECTORY block
  my $i=0;
  $j =~ s{(DIRECTORY\s*=\s*\[)(.*?)(\n\s*\];)}{ my ($x,$y,$z)=($1,$2,$3); $y =~ s/n:\s*'\d+'/sprintf("n:'%02d'",++$i)/ge; $x.$y.$z }se;
}
spit('js/museum.js',$j);
print "Edited src/index.html and js/museum.js\n";
system($^X,'tools/build-index.pl') == 0 or die "Build failed\n";
print "Rebuilt index.html. Now commit and push.\n";
