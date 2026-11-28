#!/usr/bin/perl
# Writes sitemap.xml: every page a search engine should know about.
#   the museum, its films (stories/), Heritage issues, Lineage and Honors pages,
#   tribute pages, and the Today in Signal history pages.
# Redirect stubs (pages with <meta name="robots" content="noindex">) are left out.
#
#   perl tools/gen-sitemap.pl        (also run each morning by .github/workflows/today.yml)
use strict; use warnings;
use FindBin;
chdir "$FindBin::Bin/.." or die "cannot cd: $!";
my $SITE = 'https://sc-museum.github.io';

my @pages = ('');   # the museum itself
for my $pat ('stories/*.html', 'heritage/*.html', 'lineage/*.htm', 'lineage/*.html', 'tribute/*.html', 'today/*.html') {
  for my $f (sort glob $pat) {
    open my $h, '<:raw', $f or next; local $/; my $s = <$h>; close $h;
    next if $s =~ m{<meta name="robots" content="noindex}i;
    (my $u = $f) =~ s{/index\.html$}{/};
    push @pages, $u;
  }
}
my %seen; @pages = grep { !$seen{$_}++ } @pages;
open my $o, '>:raw', 'sitemap.xml' or die $!;
print $o qq{<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n};
print $o "  <url><loc>$SITE/$_</loc></url>\n" for @pages;
print $o "</urlset>\n";
close $o;
print scalar(@pages), " pages in sitemap.xml\n";
