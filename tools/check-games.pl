#!/usr/bin/perl
# Checks js/room-games-data.js: that it parses, that every game names a real room and is well formed.
#   perl tools/check-games.pl          exit 1 and list the problems if any
use strict; use warnings; use JSON::PP; use FindBin;
chdir "$FindBin::Bin/.." or die;
binmode STDOUT, ':utf8';
open my $f, '<:raw', 'js/room-games-data.js' or die "js/room-games-data.js: $!\n"; local $/; my $t = <$f>; close $f;
$t =~ s{\A\s*/\*.*?\*/\s*}{}s;
$t =~ s{\Awindow\.ROOM_GAMES\s*=\s*}{} or die "file must start with: window.ROOM_GAMES = \n";
$t =~ s{;\s*\z}{};
my $g = eval { JSON::PP->new->utf8->decode($t) } or die "not valid JSON: $@";

my %room; for my $file (glob 'rooms/[0-9][0-9]-*.html') { open my $r, '<:raw', $file or die; my $h = <$r>; close $r; $room{$1} = $file while $h =~ /<section class="room[^"]*" id="room-([\w-]+)"/g; }
my @bad; my %count;
for my $k (sort keys %$g) {
  my $x = $g->{$k}; my $e = sub { push @bad, "$k: $_[0]" };
  $e->('no such room') unless $room{$k};
  for my $fld (qw(type title intro)) { $e->("missing $fld") unless defined $x->{$fld} && length $x->{$fld} }
  my $type = $x->{type} // ''; $count{$type}++;
  my @strings;
  if ($type eq 'quiz') {
    my $q = $x->{questions} || []; $e->('needs 3 to 8 questions, has ' . @$q) if @$q < 3 || @$q > 8;
    my $i = 0; for my $qq (@$q) { $i++;
      my $c = $qq->{choices} || [];
      $e->("q$i: needs 3 or 4 choices") if @$c < 3 || @$c > 4;
      $e->("q$i: answer out of range") unless defined $qq->{answer} && $qq->{answer} =~ /^\d+$/ && $qq->{answer} < @$c;
      $e->("q$i: missing q or why") unless length($qq->{q} // '') && length($qq->{why} // '');
      my %s; $s{lc $_}++ for @$c; $e->("q$i: duplicate choices") if grep { $_ > 1 } values %s;
      push @strings, $qq->{q}, $qq->{why}, @$c;
    }
  } elsif ($type eq 'order') {
    my $it = $x->{items} || []; $e->('needs 4 to 7 items, has ' . @$it) if @$it < 4 || @$it > 7;
    my %w; for my $o (@$it) { $e->('item missing label or when') unless length($o->{label} // '') && length($o->{when} // ''); $w{$o->{when} // ''}++; push @strings, $o->{label}, $o->{when};
      $e->("label gives away its date: $o->{label}") if ($o->{label} // '') =~ /\b(1[6-9]|20)\d\d\b/; }
    $e->('two items share the same date') if grep { $_ > 1 } values %w;
  } elsif ($type eq 'match') {
    my $p = $x->{pairs} || []; $e->('needs 4 to 7 pairs, has ' . @$p) if @$p < 4 || @$p > 7;
    my (%l, %r); for my $o (@$p) { $e->('pair missing left or right') unless length($o->{left} // '') && length($o->{right} // ''); $l{lc($o->{left} // '')}++; $r{lc($o->{right} // '')}++; push @strings, $o->{left}, $o->{right}; }
    $e->('duplicate left or right') if grep { $_ > 1 } values %l, values %r;
  } else { $e->("unknown type '$type'") }
  for my $s ($x->{title}, $x->{intro}, @strings) { next unless defined $s; $e->("HTML or entity in text: $s") if $s =~ /<\w|&\w+;/; }
}
printf "%d games: %s\n", scalar(keys %$g), join(', ', map { "$count{$_} $_" } sort keys %count);
my @none = grep { !$g->{$_} } sort keys %room; print "rooms without a game here: @none\n" if @none;
if (@bad) { print "PROBLEM $_\n" for @bad; exit 1 }
print "all games well formed\n";
