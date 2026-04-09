import asyncio
import json
import os
import random
import hashlib
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from supabase import create_client
import httpx

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://nelcuoiygfydfokxvjss.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_1pNxe4keLc7fksoIW87fRg_7pw2xY-6")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

OLLAMA_URL = "http://localhost:11434"

# Models
class PhoneVerificationRequest(BaseModel):
    phone: str
    country_code: str = "+254"

class VerifyCodeRequest(BaseModel):
    phone: str
    code: str

class BiometricRegisterRequest(BaseModel):
    credential_id: str
    public_key: str
    device_name: str
    device_type: str

class BiometricLoginRequest(BaseModel):
    credential_id: str
    signature: str

# AI Functions
async def analyze_with_ollama(prompt: str) -> str:
    """Send prompt to Ollama for AI analysis"""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "qwen2.5:7b",
                    "prompt": prompt,
                    "stream": False
                }
            )
            result = response.json()
            return result.get("response", "")
    except Exception as e:
        print(f"Ollama error: {e}")
        return ""

async def analyze_login_risk(user_id: str, ip: str, user_agent: str, device_fingerprint: str) -> Dict:
    """Analyze login attempt for fraud risk using AI"""
    # Get user's login history
    history = supabase.table("login_history").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
    
    prompt = f"""
    Analyze this login attempt for fraud risk:
    
    User ID: {user_id}
    IP Address: {ip}
    User Agent: {user_agent}
    Device Fingerprint: {device_fingerprint}
    
    Previous logins (last 10): {json.dumps(history.data, default=str)}
    
    Return as JSON:
    {{
        "risk_score": 0-100,
        "risk_level": "low/medium/high/critical",
        "reason": "Brief explanation",
        "recommended_action": "allow/block/require_2fa"
    }}
    """
    
    response = await analyze_with_ollama(prompt)
    try:
        return json.loads(response)
    except:
        return {
            "risk_score": 10,
            "risk_level": "low",
            "reason": "Normal login pattern",
            "recommended_action": "allow"
        }

# Phone Verification Functions
def generate_verification_code() -> str:
    """Generate 6-digit verification code"""
    return str(random.randint(100000, 999999))

async def send_sms(phone: str, code: str) -> bool:
    """Send SMS via Africa's Talking (placeholder - configure your API)"""
    # For production, integrate with Africa's Talking API
    # https://developers.africastalking.com/
    
    # Placeholder - in production, uncomment and add your API keys
    # api_key = os.getenv("AFRICASTALKING_API_KEY")
    # username = os.getenv("AFRICASTALKING_USERNAME")
    
    print(f"[SMS] Sending code {code} to {phone}")
    
    # For demo, return True
    return True
    
    # Real implementation:
    # import requests
    # url = "https://api.africastalking.com/version1/messaging"
    # headers = {"apiKey": api_key, "Content-Type": "application/x-www-form-urlencoded"}
    # data = {
    #     "username": username,
    #     "to": phone,
    #     "message": f"Your Kelvy CyberTech verification code is: {code}. Valid for 10 minutes."
    # }
    # response = requests.post(url, headers=headers, data=data)
    # return response.status_code == 201

async def send_whatsapp(phone: str, code: str) -> bool:
    """Send WhatsApp message via Africa's Talking"""
    # Similar to SMS but with WhatsApp API
    print(f"[WhatsApp] Sending code {code} to {phone}")
    return True

# API Endpoints
@router.post("/phone/send-code")
async def send_verification_code(request: PhoneVerificationRequest, background_tasks: BackgroundTasks):
    """Send verification code via SMS/WhatsApp"""
    try:
        # Check if phone already verified
        user = supabase.auth.get_user()
        if user.user:
            existing = supabase.table("profiles").select("phone_verified").eq("id", user.user.id).execute()
            if existing.data and existing.data[0].get("phone_verified"):
                return {"success": False, "message": "Phone already verified"}
        
        # Generate code
        code = generate_verification_code()
        
        # Store in database
        phone_full = f"{request.country_code}{request.phone}"
        expires_at = datetime.now() + timedelta(minutes=10)
        
        verification_data = {
            "user_id": user.user.id if user.user else None,
            "phone": phone_full,
            "country_code": request.country_code,
            "verification_code": code,
            "code_expires_at": expires_at.isoformat(),
            "attempts": 0,
            "created_at": datetime.now().isoformat()
        }
        
        # Delete old verification for this phone
        supabase.table("phone_verifications").delete().eq("phone", phone_full).execute()
        
        # Insert new verification
        result = supabase.table("phone_verifications").insert(verification_data).execute()
        
        # Send SMS in background
        background_tasks.add_task(send_sms, phone_full, code)
        background_tasks.add_task(send_whatsapp, phone_full, code)
        
        return {
            "success": True,
            "message": f"Verification code sent to {phone_full}",
            "expires_in": 600
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/phone/verify")
async def verify_code(request: VerifyCodeRequest):
    """Verify the 6-digit code"""
    try:
        phone_full = f"+254{request.phone}" if not request.phone.startswith("+") else request.phone
        
        # Get verification record
        verification = supabase.table("phone_verifications").select("*").eq("phone", phone_full).eq("is_verified", False).execute()
        
        if not verification.data:
            return {"success": False, "message": "No pending verification found"}
        
        record = verification.data[0]
        
        # Check expiration
        expires_at = datetime.fromisoformat(record["code_expires_at"])
        if datetime.now() > expires_at:
            return {"success": False, "message": "Code has expired. Request a new one."}
        
        # Check attempts
        if record.get("attempts", 0) >= 5:
            return {"success": False, "message": "Too many failed attempts. Request a new code."}
        
        # Verify code
        if record["verification_code"] != request.code:
            # Increment attempts
            supabase.table("phone_verifications").update({
                "attempts": record.get("attempts", 0) + 1,
                "last_attempt": datetime.now().isoformat()
            }).eq("id", record["id"]).execute()
            return {"success": False, "message": "Invalid code"}
        
        # Mark as verified
        supabase.table("phone_verifications").update({
            "is_verified": True,
            "verified_at": datetime.now().isoformat()
        }).eq("id", record["id"]).execute()
        
        # Update user profile
        user = supabase.auth.get_user()
        if user.user:
            supabase.table("profiles").update({
                "phone": phone_full,
                "phone_verified": True
            }).eq("id", user.user.id).execute()
        
        return {"success": True, "message": "Phone verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/biometric/register")
async def register_biometric(credential: BiometricRegisterRequest):
    """Register biometric credential for a user"""
    try:
        user = supabase.auth.get_user()
        if not user.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Check if credential already exists
        existing = supabase.table("biometric_credentials").select("*").eq("user_id", user.user.id).execute()
        if existing.data:
            # Update existing
            result = supabase.table("biometric_credentials").update({
                "credential_id": credential.credential_id,
                "public_key": credential.public_key,
                "device_name": credential.device_name,
                "device_type": credential.device_type,
                "last_used": datetime.now().isoformat()
            }).eq("user_id", user.user.id).execute()
        else:
            # Insert new
            result = supabase.table("biometric_credentials").insert({
                "user_id": user.user.id,
                "credential_id": credential.credential_id,
                "public_key": credential.public_key,
                "device_name": credential.device_name,
                "device_type": credential.device_type,
                "created_at": datetime.now().isoformat()
            }).execute()
        
        # Enable biometric for user
        supabase.table("profiles").update({
            "biometric_enabled": True
        }).eq("id", user.user.id).execute()
        
        return {"success": True, "message": "Biometric credential registered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/biometric/login")
async def login_with_biometric(credential: BiometricLoginRequest, request: Request):
    """Login using biometric authentication"""
    try:
        # Get credential
        credential_record = supabase.table("biometric_credentials").select("*, profiles!inner(*)").eq("credential_id", credential.credential_id).eq("is_active", True).execute()
        
        if not credential_record.data:
            return {"success": False, "message": "Invalid biometric credential"}
        
        record = credential_record.data[0]
        user_id = record["user_id"]
        
        # Verify signature (simplified - in production use proper WebAuthn verification)
        # This is a placeholder for actual WebAuthn verification
        signature_valid = True  # In production, verify the signature
        
        if not signature_valid:
            return {"success": False, "message": "Invalid signature"}
        
        # Get IP and user agent
        ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        device_fingerprint = credential.credential_id
        
        # AI Risk Analysis
        risk_analysis = await analyze_login_risk(user_id, ip, user_agent, device_fingerprint)
        
        # Log login attempt
        supabase.table("login_history").insert({
            "user_id": user_id,
            "login_type": "biometric",
            "success": True,
            "ip_address": ip,
            "user_agent": user_agent,
            "device_fingerprint": device_fingerprint,
            "risk_score": risk_analysis.get("risk_score", 0),
            "ai_analysis": json.dumps(risk_analysis),
            "created_at": datetime.now().isoformat()
        }).execute()
        
        # Update last used
        supabase.table("biometric_credentials").update({
            "last_used": datetime.now().isoformat()
        }).eq("credential_id", credential.credential_id).execute()
        
        # Get user session
        # In production, you'd create a session or return a JWT
        return {
            "success": True,
            "message": "Biometric login successful",
            "risk_analysis": risk_analysis,
            "user": {
                "id": user_id,
                "email": record.get("profiles", {}).get("email")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/login-history")
async def get_login_history():
    """Get user's login history with AI analysis"""
    try:
        user = supabase.auth.get_user()
        if not user.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        history = supabase.table("login_history").select("*").eq("user_id", user.user.id).order("created_at", desc=True).limit(50).execute()
        
        # Add AI summary
        if history.data:
            prompt = f"""
            Analyze this login history and provide security insights:
            {json.dumps(history.data, default=str)}
            
            Return as JSON:
            {{
                "summary": "Overall security assessment",
                "suspicious_activities": ["activity1", "activity2"],
                "recommendations": ["rec1", "rec2"]
            }}
            """
            ai_summary = await analyze_with_ollama(prompt)
            try:
                ai_insights = json.loads(ai_summary)
            except:
                ai_insights = {"summary": "Login history analyzed", "suspicious_activities": [], "recommendations": []}
        else:
            ai_insights = {"summary": "No login history found", "suspicious_activities": [], "recommendations": []}
        
        return {
            "success": True,
            "data": history.data,
            "ai_insights": ai_insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enable-2fa")
async def enable_2fa():
    """Enable two-factor authentication for user"""
    try:
        user = supabase.auth.get_user()
        if not user.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        supabase.table("profiles").update({
            "two_factor_enabled": True
        }).eq("id", user.user.id).execute()
        
        return {"success": True, "message": "2FA enabled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/disable-biometric")
async def disable_biometric():
    """Disable biometric authentication"""
    try:
        user = supabase.auth.get_user()
        if not user.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        supabase.table("profiles").update({
            "biometric_enabled": False
        }).eq("id", user.user.id).execute()
        
        supabase.table("biometric_credentials").update({
            "is_active": False
        }).eq("user_id", user.user.id).execute()
        
        return {"success": True, "message": "Biometric disabled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/security-status")
async def get_security_status():
    """Get user's security status with AI recommendations"""
    try:
        user = supabase.auth.get_user()
        if not user.user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        profile = supabase.table("profiles").select("*").eq("id", user.user.id).single().execute()
        
        # Get login history
        history = supabase.table("login_history").select("*").eq("user_id", user.user.id).order("created_at", desc=True).limit(20).execute()
        
        # Generate AI security recommendations
        prompt = f"""
        Based on this user's security settings and login history, provide security recommendations:
        
        Security Settings:
        - Phone Verified: {profile.data.get('phone_verified', False)}
        - 2FA Enabled: {profile.data.get('two_factor_enabled', False)}
        - Biometric Enabled: {profile.data.get('biometric_enabled', False)}
        
        Recent Logins: {len(history.data)} in last 20 entries
        
        Return as JSON:
        {{
            "security_score": 0-100,
            "strength": "weak/medium/strong",
            "recommendations": ["rec1", "rec2"],
            "missing_features": ["feature1", "feature2"]
        }}
        """
        
        ai_recommendations = await analyze_with_ollama(prompt)
        try:
            recommendations = json.loads(ai_recommendations)
        except:
            recommendations = {
                "security_score": 50,
                "strength": "medium",
                "recommendations": ["Enable 2FA", "Verify your phone number", "Set up biometric login"],
                "missing_features": []
            }
        
        return {
            "success": True,
            "data": {
                "phone_verified": profile.data.get('phone_verified', False),
                "two_factor_enabled": profile.data.get('two_factor_enabled', False),
                "biometric_enabled": profile.data.get('biometric_enabled', False),
                "phone": profile.data.get('phone'),
                "security_score": recommendations.get('security_score', 50),
                "strength": recommendations.get('strength', 'medium'),
                "ai_recommendations": recommendations.get('recommendations', []),
                "missing_features": recommendations.get('missing_features', [])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
