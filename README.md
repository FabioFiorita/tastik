  tastik/                          # Root repo                                                                              
  ├── .git/                                                                                                                 
  ├── apps/                                                                                                                 
  │   ├── ios/                     # iOS app                                                                                
  │   │   ├── Tastik.xcodeproj/                                                                                             
  │   │   ├── Tastik/                                                                                                       
  │   │   └── ...                                                                                                           
  │   └── web/                     # Web app                                                                                
  │       ├── src/                                                                                                          
  │       ├── public/                                                                                                       
  │       ├── package.json                                                                                                  
  │       ├── vite.config.ts       # Inside web                                                                             
  │       └── tsconfig.json        # Inside web                                                                             
  ├── convex/                      # Shared backend                                                                         
  │   └── ...                                                                                                               
  ├── .env.local                   # Root (for convex config)                                                               
  ├── package.json                 # Root workspace config                                                                  
  └── README.md                                                