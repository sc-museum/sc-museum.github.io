#!/usr/bin/perl
# Builds index.html, the virtual museum, from its parts:
#
#   src/index.html     page shell: <head>, top bar, dialogs, placeholders
#   rooms/NN-*.html    one file per room, in floor order (the NN prefix)
#   css/museum.css     styles          (linked as a file)
#   js/museum.js       behaviour       (loaded as a file)
#   data/images.json   image registry  (inlined, read by museum.js)
#   data/roster.json   unit roster     (inlined, read by museum.js)
#
#   perl tools/build-index.pl            write index.html
#   perl tools/build-index.pl --check    exit 1 if index.html is out of date
#   perl tools/build-index.pl --inline   inline the CSS and JS too (one-file page)
#
# Edit the parts, never index.html itself; run the build before committing.
use strict; use warnings;
use FindBin;

my %opt = map { $_ => 1 } @ARGV;
my $root = "$FindBin::Bin/..";
chdir $root or die "cannot cd to $root: $!";

sub slurp { my $p = shift; open my $f, '<:raw', $p or die "$p: $!"; local $/; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; $t }

my $page = slurp('src/index.html');

my @rooms = sort glob 'rooms/[0-9][0-9]-*.html';
die "no rooms found in rooms/\n" unless @rooms;
my $rooms = join '', map { slurp($_) } @rooms;
$page =~ s{<!-- \@rooms -->\n}{$rooms} or die "src/index.html has no <!-- \@rooms --> placeholder\n";

# every @css and @js placeholder, in the order they appear in the shell
$page =~ s{<!-- \@css (\S+) -->\n}{ $opt{'--inline'} ? "<style>\n" . slurp($1) . "</style>\n" : qq{<link rel="stylesheet" href="$1">\n} }ge
  or die "no \@css placeholder\n";
$page =~ s{<!-- \@js (\S+) -->\n}{ $opt{'--inline'} ? "<script>\n" . slurp($1) . "</script>\n" : qq{<script src="$1"></script>\n} }ge
  or die "no \@js placeholder\n";
$page =~ s{<!-- \@json (\S+) (\S+) -->\n}{
  my ($id, $path) = ($1, $2); (my $j = slurp($path)) =~ s/\n\z//;
  qq{<script id="$id" type="application/json">$j</script>\n}
}ge;

my $out = "index.html";
if ($opt{'--check'}) {
  my $cur = -f $out ? slurp($out) : '';
  if ($cur ne $page) { print STDERR "index.html is out of date: run perl tools/build-index.pl\n"; exit 1 }
  print "index.html is up to date\n"; exit 0;
}
open my $o, '>:raw', $out or die "$out: $!"; print $o $page; close $o;
printf "wrote %s from %d rooms%s\n", $out, scalar @rooms, $opt{'--inline'} ? ' (CSS and JS inlined)' : '';
