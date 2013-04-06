# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130406224345) do

  create_table "answers", :force => true do |t|
    t.string   "body"
    t.integer  "question_id"
    t.integer  "creator_id"
    t.integer  "position"
    t.integer  "comment_count"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
  end

  create_table "groups", :force => true do |t|
    t.string   "name"
    t.string   "domain"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "identities", :force => true do |t|
    t.string   "full_name"
    t.string   "email_address"
    t.string   "password_digest"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  create_table "majorities", :force => true do |t|
    t.integer  "question_id"
    t.integer  "winner_id"
    t.integer  "loser_id"
    t.integer  "pro_count",         :default => 0
    t.integer  "con_count",         :default => 0
    t.datetime "winner_created_at"
  end

  create_table "memberships", :force => true do |t|
    t.integer  "group_id"
    t.integer  "user_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "preferences", :force => true do |t|
    t.integer  "user_id"
    t.integer  "question_id"
    t.integer  "answer_id"
    t.integer  "ranking_id"
    t.float    "position"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "question_comments", :force => true do |t|
    t.integer  "question_id"
    t.integer  "creator_id"
    t.text     "body"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "question_permissions", :force => true do |t|
    t.string  "secret"
    t.integer "question_id"
    t.integer "user_id"
  end

  create_table "questions", :force => true do |t|
    t.integer  "creator_id"
    t.string   "body"
    t.integer  "ranking_count"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
    t.datetime "archived_at"
    t.string   "visibility"
    t.integer  "group_id"
    t.string   "secret"
  end

  create_table "rankings", :force => true do |t|
    t.integer  "user_id"
    t.integer  "question_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "users", :force => true do |t|
    t.string "uid"
    t.string "oauth_access_token"
    t.string "email_address"
    t.string "full_name"
    t.string "avatar_url"
    t.string "provider"
  end

end
