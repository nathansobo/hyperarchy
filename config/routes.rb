Hyperarchy::Application.routes.draw do
  root :to => 'home#show'
  match 'login' => 'sessions#new', :via => 'get', :as => "login"
  match 'login' => 'sessions#create', :via => 'post', :as => "login"
  match 'logout' => 'sessions#destroy', :via => 'post'
  match 'signup' => 'users#new', :via => 'get', :as => "signup"
  match 'signup' => 'users#create', :via => 'post', :as => "signup"

  get '/invitation/:organization_id/:invitation_code' => 'sessions#create_from_secret_url'

  get '/sandbox' => 'sandbox#fetch'
  post '/sandbox/:relation' => 'sandbox#create'
  put '/sandbox/:relation/:id' => 'sandbox#update'
  delete '/sandbox/:relation/:id' => 'sandbox#destroy'

  post '/channel_subscriptions/organizations/:id' => 'channel_subscriptions#create'
  delete '/channel_subscriptions/organizations/:id' => 'channel_subscriptions#destroy'


  resources :users
  resources :memberships do
    get :confirm, :on => :member
  end
  resources :elections
  resources :rankings
  resources :election_visits

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => "welcome#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
