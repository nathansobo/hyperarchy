require 'rails'

module Princess
  class Engine < Rails::Engine
    paths["vendor/assets"] = ["vendor/jasmine/lib", "vendor/jasmine/images"]
  end
end
