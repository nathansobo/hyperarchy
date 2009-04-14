require("prez");
require("prez/builder");
require("prez/close_tag");
require("prez/open_tag");
require("prez/post_processor");
require("prez/post_processor_instruction");
require("prez/self_closing_tag");
require("prez/text");

function raises_exception(fn) {
  try {
    fn();
  }
  catch(e) {
    return true;
  }
  return false;
}
