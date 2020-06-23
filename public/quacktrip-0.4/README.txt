QUACKTRIP -- PEER-TO-PEER HIGH-QUALITY LOW-LATENCY AUDIO

Copyright 2020 Miller Puckette.  This is open source software. free to use and
modify under the Standard Improved BSD License (lib/LICENSE.txt in this
distribution).

Quacktrip is an implementation, in Pure Data, of Chris Chafe's Jacktrip network
protocol, based on jacktrip.pd by Roman Haefeli and Johannes Schuett.  The
easiest way to use it is by opening the file, "quacktrip.pd", using Pure Data
(Pd)  version 0.51 .  You might have to upgrade your Pd installation; the first
test version of 0.51 appeared May 28, 2020.

If you have Pd 0.51 installed you only need the patches, about 30 kbytes. There
is also a downloadable archive for Macintoshes containing both the patches and
Pd itself (a few megabytes).

-------------------------------- QUICK START --------------------------

You can download the app for MacOS or Windows, or just grab the patch and run it
in Pure Data 0.51-0 or later  (You can get Pd from msp.ucsd.edu/Software/).  In
any case, once quacktrip is running you should see two windows, a "Pd" window
and the patch.  The patch will show you further directions for setting the call
name and buffer size and for starting and ending the call.

To run the patch from your own copy of Pd, unzip and open the "quacktrip"
directory (called a "folder" in MACOS).  You should see a file named
"quacktrip.pd", a sub-directory named "lib", and possibly a version of Pd if you
downloaded one.  The file "quacktrip.pd" might simply appear as "quacktrip" if
your OS is set to hide filename extensions. Open "quacktrip" (the file, not the
whole directory) using Pure Data, either by dragging the file over to the App
(on MACOS) or by starting Pure Data and opening the file from within it.  

-------------------------------- HICCUPS --------------------------

1.  On installation, and probably the first time you run quacktrip, your OS
will complain about untrusted third-party software trying to open network
connections. You should allow them; but this process might disrupt the first
call you try to make.

2.  Call names are case sensitive and can't have white space in them.
"me-and-you" will work but not "me and you".

3.  It's easy to run under an older version of Pd and not know it.  If things
aren't working check the version of Pd ("about Pd" in the help menu).

4.  If two copies of quacktrip are behind the same router, peer-to-peer calling
won't work unless you take extra steps described below.  This shouldn't be a
problem for most people since the whole point is to make connections between
people in different places.

5. Don't rearrange the "quacktrip" or "lib" directories (except to move or
remove the Pd application if you want).  "quacktrip" uses auxiliary files in
"lib" and won't find them if they aren't adjacent to quacktrip.

-------------------------------- SOME MORE DETAILS --------------------------

You don't need to read this part unless you want to do something more than a
single peer-to-peer call at a time, between two machines behind different
routers.

The "main patch", quacktrip.pd, uses a graph-on-parent abstraction called
quacktrip-panel.pd, which in turn uses the quacktrip~ object that does the real
work.  These are in the lib directory.  Also there are the conniption server
and client.  The conniption client is used by quacktrip~ to set up calls by
communicating with the conniption server.  There is a copy of the conniption
server running on the machine foo.ucsd.edu, so you don't need to do anything
about this unless you want to run your own.

quacktrip can be run in client/server mode; in this configuration one caller
acts as the server and needs to have an IP address that is visible to the
other.  This functionality isn't available via the quacktrip.pd patch, but
can be set up by directly opening the help window for quacktrip~.  (You can
even make a connection between the two copies of quacktrip~ in the help file).
You can use that help file itself, modified for your own addresses, to make
local connections between machines behind the same router.

In client-server mode quacktrip should be compatible with jacktrip; i.e., one
party can use a jacktrip server and the other can use a quacktrip client or
vice versa.  It might be possible to connect to a jacktrip hub this way, so
that many different parties with quacktrip and/or jacktrip running can share
audio that is routed through the hub instead of point-to-point.  As far as I
know nobody has tried this yet.

If you want to make 2 or more calls simultaneously, you can: (1) run two copies
of the patch in two copies of Pd; (2; better) run them in the same copy of Pd;
or (3; best of all) copy and paste the objects in the main patch, quacktrip.pd
as many times as desired.

There are comments in the quacktrip patch that go into more detail about this.




