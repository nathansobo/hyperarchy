require("/lib/prez");
require("/lib/prez/builder");
require("/lib/prez/close_tag");
require("/lib/prez/open_tag");
require("/lib/prez/post_processor");
require("/lib/prez/post_processor_instruction");
require("/lib/prez/self_closing_tag");
require("/lib/prez/text");
require("/lib/prez/form");
require("/lib/prez/string");

function raises_exception(fn) {
  try {
    fn();
  }
  catch(e) {
    return true;
  }
  return false;
}
