---
title: "Programming away the mundane"
date: 2025-06-28
---

[[toc]]

## Thesis

This article attemps to articulate a mysterious feeling that I usually have when automating mundane tasks using small scripts -  mostly written in dynamic languages like perl/javascript/python. The joy of seeing your creation taking shape and doing your bidding is unimaginable but not beyond experienceable. The moment you get an immediate feedback from successfully running a script, you are locked in and it is hard to let go of the flow. I hope this article rekindle in some reader the magic of programming.

## Case Studies

In order to illustrate my points, I will use many small utility tools I wrote as specimen, explaining the motivation for its existence and how and why it was fun but more importantly to put on notice a feeling akin to romanticism intermixed with a sense of pleasing one's own self.

### 1) Remove ^M (press Ctrl + V and M in succession) character at the end of line.

I wrote the below script in Perl. Perl was and probably is pejoratively considered as a "write only" language. But Perl was the first language that I professionally programmed in - a project to port Perl CGI web application to Java web application. Until few years ago, Perl was the first scripting language that I had reached for to implement small single purpose utility tool. Now it is Python.

```perl
  use strict;
  use warnings;

  use Getopt::Long;
  use Tie::File;

  # CTRL+M at eol is due to performing FTP from windows to unix without using Binary mode.
  # If CTRL+M char is found then the user needs write permission on the file to remove it.
  sub check_and_remove_control_M_character {
    exit unless @ARGV > 0;
    chomp(@ARGV);
    print "\nFiles checked for CTRL+M characters:\n";
    foreach(@ARGV) {
      print $_."\n";
      tie my @lines, 'Tie::File', $_ or die "Error when using file $_:$!";
      for(@lines) {
        s/\r//g;  #remove CTRL+M in each row of the file
      }
      untie @lines;
    }
  }

  do {

    print "Usage: \n";
    print "remove_ctrlm_char --removeControlChar <space separated list of path/to/files>\n";

  } unless @ARGV != 0 && ($ARGV[0] eq '--removeControlChar');
  my %opts;
  GetOptions (\%opts, 'removeControlChar');
  &check_and_remove_control_M_character if($opts{removeControlChar});
```

From git history, the above script was written ~9 years ago. If I have to judge the code quality now, I would think it fared well in terms of code size to functionality and I was able to understand what it does. I forgot what `tie` and `untie` does but vaguely guessed and then confirmed via github copilot that it associates an array with the lines in a file via `Tie::File` module. When the array is updated, `untie` commit's the changes back to the file via same `Tie::File` module. I had the good sense to add comments and a descriptive subroutine name while the option `removeControlChar` could have been named as `files`. In present time, by taking advantage of local agentic tools, I could add this script to my `$PATH` and enable agents to use them to clean files containing CTRL+M characters before opening a pull request. When I first ran and saw it worked, I must have been on cloud nine and started liking Perl with warts and all. I think programmers ardently support their favorite languages with tooth and nail not because of its technical merit but the original magic it made them feel when they finally got a useful program to do their bidding. It is emotions all the way down.


### 2) Bounded mock data generator

```perl
  #!/usr/bin/env perl

  ############################################################################
  #
  # Quick script to generate random rows of comma separated
  # values (duplicates possible).
  # This can be used to generate random sample of mock data.
  # The number of rows and path where the data file should be created can be
  # changed via command line.
  #
  # The __DATA__ section can be modified to fit the use case
  #
  # Usage: perl mockgen.pl 5000 samples
  #
  ############################################################################

  use IO::File;
  use Cwd qw(abs_path);
  use File::Basename qw(fileparse dirname);
  use File::Path qw(make_path);

  sub generate {

    my $n = shift || 1000;
    my $abs_file = shift || dirname(abs_path($0)) . "/samples";
    my ($file, $dirpath) = fileparse $abs_file;

    make_path $dirpath or die "Failed to create path: $dirpath $!\n" unless (-e $dirpath);

    unlink $abs_file if (-e $abs_file);
    open(my $fo, '>:encoding(UTF-8)', $abs_file) or die "Couldn't open file $file";

    print "no of rows generated: ". $n . "\n";

    for(1 .. $n) {

      my $pos = tell DATA;
      my @data = map { $_ } <DATA>;
      my $row = "";

      map { 
        my @options = (split /\|/, $_);
        $row = $row . $options[rand $#options] . ',';
      } @data;

      chop $row; # remove the last ,

      print $fo $row . "\n";

      seek DATA, $pos, 0; #reset to start of __DATA__
    }

    close $fo;
    print "file created at location $abs_file \n";
  }

  generate(@ARGV);

  __DATA__
  joe|jane|priya|karen|arthur|leo|sinai|yang
  23|32|56|78|12|29|32|34
  M|F|F|F|M|M|M|M
  USA|USA|IND|USA|USA|USA|RUS|CHN
```
This script was written ~8y ago. I wanted a way to randomly generate permuted combination of synthetic data all from a mock list of pre-built collection of initial seed of data.

Coming back to this script now, I think this script is buggy and doesn't even do a good job of satisfying its main requirement. Firstly, the random selection could populate the same value in each column. Secondly, because the script doesn't have contextual information about the data, it can combine columns from different rows that may be semantically inaccurate. 

But it must have worked for a limited use-case and I had the pleasure of discovering `__DATA__`, `tell`, `map`, `seek` and other file operations in Perl. The script had comments and the logic straightforward when I read it again now. By changing `__DATA__` any generic table of rows can be mix and matched.

### 3) Number of files of certain type

```js
  var recursive = require('recursive-readdir');
  const path = require('path');
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var dir, ext;

  function readParams() {
    readPathAndExt();
  }

  function readPathAndExt() {
    rl.question('Enter the root folder path: ', function(answer){
      dir = answer;
      readExt();
    })
  }

  function readExt() {
    rl.question('Enter the target file extension: ', function(answer){
      ext = answer;
      rl.close();
      callRecursive();
    });
  }

  function callRecursive() {
    recursive(dir, [ignoreFunc], function(err, files){
      console.log("Total number of files are: ", files.length);
      console.log("Total number of target files are: ", numFiles);
    });
  }

  var numFiles = 0;

  /**
  * Always return false to process all files. Using this only to count no of target files.
  */
  function ignoreFunc(file, stats) {
    path.extname(file) == '.'.concat(ext) ? ++numFiles : 0;
    return false;
  }

  //main
  function main() {
    readParams();
  }

  main();
```

A script that I wrote ~8yrs ago to print number of files of a particular file extension. I could have just used `find /path/to/folder -type f -name "*.ext" | wc -l` but I decided to implement a javascript utility program. It was a classic NIH (Not Invented Here) itch that I tried to scratch but I must have had an absolute blast learning about npm modules like `path`, `readline` and `recursive-readdir`. It was both silly and useful with user interaction to boot. Reading it now, I am embarrassed that it used global variables and no error handling but that is the point of quick and dirty scripts like this which will never see the light of production.

### 4) Magic 8 Ball answer generator.

```ruby
  # frozen_string_literal: true

  ##
  # This class represents the Magic 8 Ball.
  #
  # Create `answers.txt` in the same directory as the script and 
  # add below lines to the file:
  #
  # Most likely
  # You may rely on it
  # Ask Again Later
  # It is certain
  # My reply is No
  # My sources say No
  # Outlook good
  # Signs point to Yes
  # Very doubtful
  # Without a doubt
  # Yes
  #
  # Run it like below:
  #
  # require 'magic8ball'
  # magic8ball = Magic8Ball.new
  # print magic8ball.ask("Will it rain today?")
  class Magic8Ball

      # Public: Setup magic 8 ball.
      #
      # answers_file_path - path to a file which contains list of possible answers.
      #   Defaults to the file within the app directory.
      #
      # consistency - If true, then same question will always yield same random answer.
      #   If not, it returns a random answer everytime even for same question.
      #
      # Returns nothing.
      def initialize(answers_file_path:File.join(File.dirname(__FILE__), 'answers.txt'), consistency:false)
          @answers = []
          File.open(answers_file_path).each do |answer|
              @answers.push(answer.chomp)
          end
          @consistency = consistency
      end

      # Public: Main method to ask a question to magic 8 ball.
      #
      # question - question that is asked to magic 8 ball. Cannot be nil.
      #
      # Returns the answer.
      def ask(question=nil)
          return "You must ask a question!" unless question
          if @consistency
              hash = 0
              question.split.each do |word|
                  hash += word.ord
              end
              return @answers[hash % (@answers.length() - 1)]
          else
              return @answers[rand(0..(@answers.length() - 1))]
          end
      end
  end
```

This script doesn't serve me anything practical other than putting a smile on my face. It is supposed to be a magic crystal used by an oracle who prophesize answer to your questions. Goofy and I love it. I actually ported it to Ruby from someone else's Perl version. Git history shows ~2yrs ago. I must have been bitten by Ruby bug again. I always loved Ruby as a language and read many books about it but never had a chance to work on it professionally - this script could have been my unconscious bias to compensate for that lack.

## Epilogue

In my long career as a software engineer, there were many more utility scripts (both fun and silly) that I had written either for side-project or work that I don't have the space or patience to cover in this article. The bottom line is, programming away the mundane gives a pretext to experiment with various ideas in my mind and a cathartic release (psychologically speaking) for producing something creative to meet my own ends rather than as a trade artifact to be used in the machinary of capitalism in exchange for profit.