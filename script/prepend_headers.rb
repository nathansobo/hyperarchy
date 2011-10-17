#!/usr/bin/env ruby

DIRECTORIES = {
  'rb' => ['app', 'lib', 'config'],
  'js' => ['app/assets/javascripts', 'vendor/princess/', 'vendor/socket_server'],
  'sass' => ['app/assets/stylesheets'],
  'erb' => ['app/views', 'lib/deploy/resources']
}

EXCLUSIONS = {
  'rb' => ['vendor'],
  'js' => ['node_modules', 'vendor']
}

HEADER_FILES = {
  'rb' => 'script/header.rb',
  'js' => 'script/header.js',
  'sass' => 'script/header.js',
  'erb' => 'script/header.erb'
}

def prepend_headers_for_filetype(extension)
  directories     = DIRECTORIES[extension].join(' ')
  exclusion_flags = EXCLUSIONS[extension].reduce("") {|string, expression| string + " -v #{expression}"} if EXCLUSIONS[extension]
  header_file     = "script/header.#{extension}"

  find_command    = "find #{directories} -name '*.#{extension}'"
  filter_command  = exclusion_flags ? "grep #{exclusion_flags}" : "cat"
  prepend_command = "xargs -I file script/prepend #{header_file} file"

  command = "#{find_command} | #{filter_command} | #{prepend_command}"
  puts command
  system command
end

prepend_headers_for_filetype('rb')
prepend_headers_for_filetype('js')
prepend_headers_for_filetype('sass')
prepend_headers_for_filetype('erb')

