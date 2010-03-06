require 'find' 

Find.find(ARGV[0]) do |file_name| 
  Find.prune if file_name =~ /vendor$/
  if File.file?(file_name) && file_name =~ /\.(js|css)/
    lines = File.open(file_name) { |file| file.readlines }
    
    changed = false
    lines.each do |line|
      next if line =~ %r{^//=}
      if line.gsub!(/(\w)(_)([a-z0-9])/) { $1 + $3.upcase }
        changed = true 
        puts line
      end
    end

    next unless changed      
    File.open(file_name, "w") do |file|
      p file_name
      lines.each do |line|
        file.write(line)
      end
    end    
  end
end