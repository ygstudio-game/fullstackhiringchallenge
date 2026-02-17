# import os
# from contextlib import asynccontextmanager
# from fastapi import FastAPI, HTTPException, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from motor.motor_asyncio import AsyncIOMotorClient
# from bson import ObjectId
# import google.generativeai as genai
# from dotenv import load_dotenv
# from datetime import datetime, timedelta
# from typing import Optional
# from pydantic import BaseModel, Field
# import bcrypt
# import jwt
# from jwt.exceptions import PyJWTError
# from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# load_dotenv()

# # --- DATABASE SETUP ---
# MONGO_URL = os.getenv("MONGODB_URL")
# client = AsyncIOMotorClient(MONGO_URL)
# db = client.smart_editor_db
# posts_collection = db.get_collection("posts")
# users_collection = db.get_collection("users")

# # --- AI SETUP ---
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# # --- AUTH SETUP ---
# SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.getenv("JWT_SECRET"))
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# # --- AUTH UTILITIES (NATIVE BCRYPT) ---
# def verify_password(plain_password: str, hashed_password: str):
#     return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# def get_password_hash(password: str):
#     salt = bcrypt.gensalt()
#     return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# def create_access_token(data: dict):
#     to_encode = data.copy()
#     expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id: str = payload.get("sub")
#         if user_id is None:
#             raise HTTPException(status_code=401, detail="Invalid token")
#         return user_id
#     except PyJWTError:
#         raise HTTPException(status_code=401, detail="Invalid token")

# # --- PYDANTIC SCHEMAS ---
# class UserCreate(BaseModel):
#     email: str
#     password: str

# class PostUpdateSchema(BaseModel):
#     lexical_state: Optional[dict] = None  
#     status: Optional[str] = None
#     title: Optional[str] = None

# class AIRequest(BaseModel):
#     text: str

# class AIGenerateRequest(BaseModel):
#     text: str
#     action: str 

# # --- LIFECYCLE ---
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     yield
#     client.close()

# app = FastAPI(lifespan=lifespan, title="Smart Editor API")

# # --- CORS CONFIGURATION ---
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[os.getenv("FRONTEND_URL")],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*", "Authorization", "Content-Type"], 
# )

# # --- AUTHENTICATION ROUTES ---
# @app.post("/api/auth/signup")
# async def signup(user: UserCreate):
#     existing_user = await users_collection.find_one({"email": user.email})
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")
        
#     hashed_password = get_password_hash(user.password)
#     new_user = {"email": user.email, "password": hashed_password}
#     result = await users_collection.insert_one(new_user)
    
#     access_token = create_access_token(data={"sub": str(result.inserted_id)})
#     return {"access_token": access_token,"email": user.email, "token_type": "bearer"}

# @app.post("/api/auth/login")
# async def login(form_data: OAuth2PasswordRequestForm = Depends()):
#     user = await users_collection.find_one({"email": form_data.username})
#     if not user or not verify_password(form_data.password, user["password"]):
#         raise HTTPException(status_code=401, detail="Incorrect email or password")
        
#     access_token = create_access_token(data={"sub": str(user["_id"])})
#     return {"access_token": access_token,"email": form_data.username, "token_type": "bearer"}

# # --- SECURED POST ROUTES ---
# @app.post("/api/posts/")
# async def create_draft(user_id: str = Depends(get_current_user)):
#     new_post = {
#         "title": "Untitled Draft",
#         "lexical_state": {"root": {"children": [], "direction": None, "format": "", "indent": 0, "type": "root", "version": 1}}, 
#         "status": "DRAFT",
#         "user_id": user_id,
#         "created_at": datetime.utcnow(),
#         "updated_at": datetime.utcnow()
#     }
#     result = await posts_collection.insert_one(new_post)
#     return {"_id": str(result.inserted_id), "message": "Draft created"}

# @app.patch("/api/posts/{post_id}")
# async def update_post(post_id: str, update_data: PostUpdateSchema, user_id: str = Depends(get_current_user)):
#     if not ObjectId.is_valid(post_id):
#         raise HTTPException(status_code=400, detail="Invalid Document ID")
        
#     update_dict = update_data.model_dump(exclude_unset=True)
#     update_dict["updated_at"] = datetime.utcnow() 
    
#     result = await posts_collection.update_one(
#         {"_id": ObjectId(post_id), "user_id": user_id},
#         {"$set": update_dict}
#     )
    
#     if result.matched_count == 0:
#         raise HTTPException(status_code=404, detail="Post not found or unauthorized")
        
#     return {"message": "Updated successfully"}
# oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# async def get_optional_user(token: Optional[str] = Depends(oauth2_scheme_optional)):
#     """Allows endpoints to be hit by guests, returning None if not logged in."""
#     if token is None:
#         return None
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload.get("sub")
#     except PyJWTError:
#         return None
# @app.get("/api/posts/")
# async def get_all_posts(user_id: str = Depends(get_current_user)):
#     posts = []
#     async for post in posts_collection.find({"user_id": user_id}):
#         posts.append({
#             "_id": str(post["_id"]),
#             "title": post.get("title", "Untitled Draft"),
#             "content": post.get("lexical_state", {}), 
#             "status": post.get("status", "DRAFT"),
#             "updated_at": post.get("updated_at", datetime.utcnow().isoformat())
#         })
#     return posts

# @app.get("/api/posts/{post_id}")
# async def get_post(post_id: str, user_id: Optional[str] = Depends(get_optional_user)):
#     if not ObjectId.is_valid(post_id):
#         raise HTTPException(status_code=400, detail="Invalid Document ID")

#     # Fetch the post WITHOUT enforcing ownership yet
#     post = await posts_collection.find_one({"_id": ObjectId(post_id)})

#     if not post:
#         raise HTTPException(status_code=404, detail="Post not found")
        
#     is_owner = user_id is not None and post.get("user_id") == user_id
#     is_published = post.get("status") == "PUBLISHED"

#     # Security Guard: Block if it's a draft and they aren't the owner
#     if not is_published and not is_owner:
#          raise HTTPException(status_code=403, detail="This document is private.")
        
#     return {
#         "_id": str(post["_id"]),
#         "title": post.get("title", "Untitled Draft"),
#         "lexical_state": post.get("lexical_state", {}),
#         "status": post.get("status", "DRAFT"),
#         "is_owner": is_owner # Tells the frontend if the viewer has edit rights
#     }

# @app.post("/api/posts/{post_id}/publish")
# async def publish_post(post_id: str, user_id: str = Depends(get_current_user)):
#     if not ObjectId.is_valid(post_id):
#         raise HTTPException(status_code=400, detail="Invalid ID")

#     result = await posts_collection.update_one(
#         {"_id": ObjectId(post_id), "user_id": user_id},
#         {"$set": {"status": "PUBLISHED", "updated_at": datetime.utcnow()}}
#     )
    
#     if result.matched_count == 0:
#          raise HTTPException(status_code=404, detail="Post not found or unauthorized")
         
#     return {"status": "PUBLISHED"}

# # --- AI ROUTES ---
# @app.post("/api/ai/fix-grammar")
# async def fix_grammar(request: AIRequest):
#     try:
#         model = genai.GenerativeModel('gemini-2.5-flash')
        
#         # We explicitly tell the AI to preserve Markdown formatting
#         prompt = f"""You are an expert editor. Fix the grammar, spelling, and improve the clarity of the following text.
#         CRITICAL INSTRUCTION: The text is formatted in Markdown. You MUST preserve all existing Markdown formatting (headings, bold, italics, lists, quotes, code blocks).
#         Do not add any conversational filler. Return ONLY the improved Markdown text.

#         Original Text:
#         {request.text}
#         """
        
#         response = model.generate_content(prompt)
#         return {"improved_text": response.text.strip()}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    

# @app.post("/api/ai/generate")
# async def generate_text(request: AIGenerateRequest):
#     """Bonus: AI text completion and summarization."""
#     try:
#         model = genai.GenerativeModel('gemini-2.5-flash')
        
#         if request.action == "summarize":
#             prompt = f"""You are an expert editor. Provide a brief, professional 1-2 sentence summary of the following text. 
#             Return ONLY the summary text, no conversational filler or markdown formatting.
            
#             Text:
#             {request.text}"""
                    
#         elif request.action == "continue":
#             prompt = f"""You are an autocomplete engine. Complete the following sentence fragment.
#             Return ONLY the next 3 to 5 words. Do not repeat the input.
            
#             Input: {request.text}
#             Completion:"""
#         elif request.action == "title": # <--- ADD THIS BLOCK
#             prompt = f"Generate a short, catchy, 3 to 6 word title for the following document. Do not use quotes or prefixes. Return ONLY the title.\n\nDocument text: {request.text[:2000]}"    
#         else:
#             raise HTTPException(status_code=400, detail="Invalid action type")
            
#         response = model.generate_content(prompt)
#         return {"generated_text": response.text.strip()}
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

from app.config import settings
from app.database import db_instance
from app.routers.auth import router as auth_router
from app.routers.posts import router as posts_router
from app.routers.ai import router as ai_router

# --- Configure Gemini globally ---
genai.configure(api_key=settings.GEMINI_API_KEY)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB at startup
    db_instance.connect_db()
    yield
    # Close connection at shutdown
    db_instance.close_db()

# --- FastAPI Initialization ---
app = FastAPI(
    title="Smart Editor API",
    lifespan=lifespan
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization", "Content-Type"],
)

# --- Register Routers ---
app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(ai_router)
