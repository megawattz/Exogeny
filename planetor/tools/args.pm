package Args;

use strict 'vars';
use warnings;

our $Verbose = 3;

sub new
{
  my ($class, $definitions, $config_text)  = @_;

  if (!defined($definitions->{help})) {
    die 'Usage: new Args($options) where options are (for example):
    {
    	help => {  # this one is mandatory
	     value => "0",  # if this is true, then help will be displayed and program exited
     	     help => "Describe how to user your application with examples etc (parameters and options and defaults will be automatically listed after)",
   	},
	verbose => { 
	     value => "0",  
     	     help => "Show more info (suggested: 1=errors, 2=warnings, 3=normal, 4=more, 5=unexpected, 6=all)"
   	},
	pre => { 
     	     help => "Load extraction parameters from the perl __DATA__ area [name] followed by parameters, 1 per line, no surrounding \" needed)"
	     value => "",  
	     action => "Execute this code, if the result is a true value, set the default value to it"
   	},
    	example_option1 => { 
	     value => "default value of example_option1",
       	     help => "explanation of example_option1" 
        },
    	example_option2 => { 
	     value => "default value of example_option2",
       	     help => "explanation of example_option2",
 	     action => sub { $_[0] is option->{value}, do something, if returned is defined, set option->value to that new value }
        },
    	"" => { # no name parameters, options without a --key. 
	     label => "a label to use in help output (because they have no --key)",
	     values => "NOTE PLURAL! "default value(s) (an array), will be overwritten if options given on commandline",
       	     help => "explanation of no named options" 
        }
   }
';
  }
  
  my @CONFIGS = @ARGV; # use our own copy of the @ARGS because we may want to modify them
 # commandline arguments will be stored in this
  my $self = {};
  my $noname_count = 0;
  $self->{''} = []; # noname parameters
  # if the user specified a definition for help_format use that, otherwise us a default
  my $help_format = $definitions->{help_format} || "%-16.16s %-22s %s\n";
  my $help_general = $definitions->{help}->{help}."\n";
  # format a heading line for displaying options and their definitions
  $help_general .= sprintf($help_format, "\n== Options ====", "== Default Value ====", "== Explanation ===============");
  my $param_help = "";
  my $shortmap = {}; # map short options to long ones
  
  # initialize the $self map with the default values form the definitions passed into the constructor
  # also build up the help text from each options help parameter.
  my @keys = sort keys %$definitions;
  for my $key (@keys) {
    my $def = $definitions->{$key};
    if ($key) {
      $self->{$key} = $def->{value} || "";
    } else {
      $self->{$key} = $def->{values} || [];
    }
    
    my $shortkey = substr($key,0,1);
    die "Must not have duplicate short keys, -$shortkey already exists for --$shortmap->{$shortkey}" if $shortmap->{$shortkey};
    $shortmap->{$shortkey} = $key; # shortmap, used to look up long $key

    # append the help text for this option to the entire help string
    if ($def->{help}) { # dynamically build the help string
      if ($key ne "help") { # don't show the help string itself as a parameter help
	$param_help .= sprintf($help_format, sprintf("%s%s",
						     $key ? "--$key," : $def->{label} || 'arguments',
						     $key ? "-".substr($key, 0, 1) : ''),
			       $def->{values} ? "@{$def->{values}}" : $def->{value} =~ s/\n/\\n/gr || '""',
			       $def->{help} || die "Must specify help for: $key");
      }
    }
  }

  my $help = hanging_indent($help_general, 160, 0).hanging_indent($param_help, 160, 40);
 
  my @keystack = ();

  # do this because it allows us to insert values while the CONFIGS is being iterated, like if the command
  # line says "read a config file" we read it in, right in the middle of processing the commandline
  # and put it's additional parameters right up in there
  while (defined(my $arg = shift @CONFIGS)) {
    
    message(7, "  ARG:'$arg'");
    # did we get a key? (an argument with -'s in front of it)
    if ($arg =~ /^-/) {
      if ($arg eq '-') {
	$self->{'input'} = STDIN;
	next;
      }
	
      my ($dashes, $first, $tail, $longvalue) = $arg =~ /(--?)([a-zA-Z])([^=]*)=?(.*)/;
      if ($dashes) {
	message(7, "  dashes:$dashes first:$first tail:$tail longvalue:$longvalue");
	my $key = $shortmap->{$first} || die "Unknown Option: $arg\n\n".$help;
	if (@keystack) { # already have a key stored? it's a no argument boolean, set it to 1
	  message(7, "resolve previous key with an implicit value, 1 meaning true");
	  $self->{pop(@keystack)} = 1;
	}
	$arg = undef;
	push(@keystack, $key);
	$arg = $tail if $dashes eq '-' && ($tail || $tail eq 0); # short option, use tail as value (like -q1 or -H"my header"
	$arg = $longvalue if $longvalue;
	next if !defined $arg;
      }	
    }

    # key waiting for value? we got it
    if (@keystack) {
      $arg =~ s/\\n/\n/g;
      $arg =~ s/\\t/\t/g;
      $arg =~ s/\\n/\n/g;
      $arg =~ s/\\\\/\\/g;
      my $name = pop(@keystack);
      if ($definitions->{$name}->{action}) {
	my $temp = $definitions->{$name}->{action}($arg);
	$arg = $temp if defined $arg;
      }
      $self->{$name} = $arg;
      $Args::Verbose = int($arg) if ($name eq 'verbose');
      if ($name eq "pre" && $config_text) {
	my @extras = ParseConfigText($arg, $config_text);
	unshift(@CONFIGS, @extras); # insert precanned args into the CONFIG list
	message(7, "new configs: ", map {"'$_' "} @CONFIGS);
      }
      next;
    }

    # if we never get here, the default values in
    # $definitions->{''}->{values} (an array) will be retained, however
    # any command line arguments given will overwrite each
    # corresponding default and add more parameters if desired
    $self->{''}[$noname_count++] = $arg;  # overwrites any corresponding default given in $defaults->{''}->{value}
  }
  
  # trailing argument is tricky
  if (@keystack) {
    my $name = pop(@keystack);
    if ($definitions->{$name}->{action}) {
      my $temp = $definitions->{$name}->{action}("1");
    }	
    $self->{$name} = "1";
  }

  if ($Args::Verbose >= 5) {
    eval {
      use Data::Dumper;
      message(5, Data::Dumper->Dump([$self], ["Command Line Arguments"]));
    };
    message(6, "Install Data::Dumper to see arguments detail") if $@;
  }	
  
  die $help."\n" if $self->{help};
  
  bless \$self;

  return $self;      	
}

sub message {
  my $priority = shift;
  return if ($priority > int($Args::Verbose));
  print "\n" if $priority < 5; 
  print "-- ", @_, "\n";
}	

sub hanging_indent {
  my ($content, $width, $indent) = @_;
  my $formatted = "";
  my @text = $content =~ /(.*?\r*\n)/gs; # split out lines
  #print join("=>", @text);
  for my $line (@text) {
    #print "LINE: $line\n";
    my ($head, $tail) = $line =~ /(.{1,$width})\s+(.*)/; # find width characters, then add whatever non-whitespace characters remain
    next if !$head;
    #print "$width HEAD: $head\nTAIL: $tail\n";
    $formatted .= ($head."\n"); # output the $head
    if ($tail) {
      my $indentwidth = $width - $indent; # width of secondary lines is much less, they will be indented
      my @chunks = $tail =~ /(.{1,$indentwidth})\s*/gs;
      for (@chunks) {
	$formatted .= ((" " x $indent).$_."\n");
      }
    }
    $formatted .= "\n";
  }
  return $formatted;
}

sub ParseConfigText {
  my ($name, $text) = @_;
  my @rval = ();
  $text =~ s/#.*//g; # everything after # is a comment
  my $indata = 0;  # when we find our particular configuration block, set this to true
  my @args = $text =~ /('.*?'|\S+)/gsm;
  for (@args) { s/^\'(.*)\'$/$1/g; }
  #print "\n\n", join("\n", @args), "\n\n";
  #exit 0;
  for $_ (@args) {
    # filter out empty lines
    next if $_ !~ /\S/; # skip if line contains only whitespace
    # detect a configuration block, i.e. [name]
    my ($marker) = $_ =~ /^\s*\[(.+?)\]\s*$/;
    return @rval if $indata && $marker; # already in a config block, and found a new one? We are done
    $indata = 1 if $marker && $marker eq $name; # we are on a marker line, and it's the one we are looking for?
    next if $marker; # don't include marker line in config data
    next if !$indata;
    push(@rval, $_);
  }
  
  die "Configuration section $name not found\n" if !@rval;
  
  return @rval; # reached end of DATA section
}

1;
