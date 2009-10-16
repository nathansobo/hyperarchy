require "find"

Find.find(".") do |path|
  next unless path =~ /\.js$/
  contents = IO.read(path)

  if contents.include?('jQuery')
    new_contents = "(function(Monarch, jQuery) {\n\n" + contents + "\n})(Monarch, jQuery);\n"
  else
    new_contents = "(function(Monarch) {\n\n" + contents + "\n})(Monarch);\n"
  end

  File.open(path, 'w+') do |f|
    f.write(new_contents)
  end
end
