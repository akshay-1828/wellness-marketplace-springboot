#!/usr/bin/env pwsh
# Maven wrapper script that ensures Java 21 is used

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"

# Run Maven with passed arguments
& mvn $args
