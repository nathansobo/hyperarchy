$LOAD_PATH << Rails.root.join('vendor', 'gift_wrapper', 'lib')
require 'gift_wrapper'

javascripts_root = Rails.root.join('client_src', 'javascripts')
javascripts_vendor_root = javascripts_root.join('vendor')
monarch_root = javascripts_vendor_root.join('monarch')

Rails.application.middleware.insert_before(ActionDispatch::Static, GiftWrapper)
GiftWrapper.mount_package_dir(Rails.root.join('public', 'assets'), "assets")

GiftWrapper.mount(javascripts_root.join('vendor', 'monarch', 'lib'), '/__monarch_lib__')
GiftWrapper.mount(javascripts_root.join('vendor', 'monarch', 'vendor'), '/__monarch_vendor__')
GiftWrapper.mount(javascripts_root.join('vendor'), '/__vendor__')
GiftWrapper.mount(javascripts_root.join('app'), '/__app__')

if Rails.env =~/development|test/
  GiftWrapper.development_mode = true
end