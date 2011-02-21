$LOAD_PATH << Rails.root.join('vendor', 'gift_wrapper', 'lib')
require 'gift_wrapper'

Rails.application.middleware.insert_before(ActionDispatch::Static, GiftWrapper)
GiftWrapper.mount_package_dir(Rails.root.join('public', 'assets'), "assets")

javascripts_root = Rails.root.join('public', 'javascripts')
javascripts_vendor_root = javascripts_root.join('vendor')

# put monarch on the js load path
monarch_root = javascripts_vendor_root.join('monarch')
GiftWrapper.mount(monarch_root.join('lib'), '/__monarch__/lib')
GiftWrapper.mount(monarch_root.join('vendor'), '/__monarch__/vendor')

# put vendor and app code
GiftWrapper.mount(javascripts_vendor_root, '/__vendor__')
GiftWrapper.mount(javascripts_root, '/__javascripts__')


if Rails.env =~/development|test/
  GiftWrapper.development_mode = true
end