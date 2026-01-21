import httpx
import os
from fastapi import APIRouter, Request, HTTPException, Response
from app.ai import run_ai_pipeline, transcribe_audio
from app.config import settings

router = APIRouter(prefix="/webhook", tags=["WhatsApp"])

# Get credentials from environment
WHATSAPP_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "shiksha_mitra_webhook_2024")

WHATSAPP_API_URL = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"


# ============ WEBHOOK VERIFICATION (GET) ============
@router.get("/whatsapp")
async def verify_webhook(request: Request):
    """Meta verifies webhook with GET request during setup"""
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        print("✅ Webhook verified successfully!")
        return Response(content=challenge, media_type="text/plain")

    raise HTTPException(status_code=403, detail="Verification failed")


# ============ MESSAGE HANDLER (POST) ============
@router.post("/whatsapp")
async def handle_whatsapp_message(request: Request):
    """Receive and process incoming WhatsApp messages"""
    body = await request.json()

    try:
        # Extract message data from webhook payload
        entry = body.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        # No messages to process
        if not messages:
            return {"status": "no_messages"}

        message = messages[0]
        sender_phone = message["from"]  # Teacher's phone number
        message_type = message["type"]

        # Use last 10 digits as teacher_id
        teacher_id = f"T_{sender_phone[-10:]}"

        print(f"📩 Message from {sender_phone} | Type: {message_type}")

        # ===== HANDLE TEXT MESSAGE =====
        if message_type == "text":
            query = message["text"]["body"]
            print(f"📝 Text: {query}")

            # Process through AI pipeline
            response = await run_ai_pipeline(query, teacher_id)

            # Send response back
            await send_whatsapp_message(sender_phone, response.answer_text)

            return {"status": "text_processed", "query": query}

        # ===== HANDLE VOICE MESSAGE =====
        elif message_type == "audio":
            audio_id = message["audio"]["id"]
            print(f"🎤 Voice message received: {audio_id}")

            # Download audio from WhatsApp servers
            audio_bytes = await download_whatsapp_media(audio_id)

            if not audio_bytes:
                await send_whatsapp_message(
                    sender_phone,
                    "❌ Audio download failed. Please try again."
                )
                return {"status": "download_failed"}

            # Transcribe audio to text
            transcribed_text = await transcribe_audio(audio_bytes, "voice.ogg")

            if not transcribed_text:
                await send_whatsapp_message(
                    sender_phone,
                    "🎤 आवाज़ समझ नहीं आई। कृपया फिर से बोलें।\n(Voice not understood. Please try again.)"
                )
                return {"status": "transcription_failed"}

            print(f"📝 Transcribed: {transcribed_text}")

            # Send acknowledgment with transcription
            await send_whatsapp_message(
                sender_phone,
                f"🎧 *आपका सवाल:*\n\"{transcribed_text}\"\n\n⏳ जवाब तैयार हो रहा है..."
            )

            # Get AI response
            response = await run_ai_pipeline(transcribed_text, teacher_id)

            # Send final answer
            await send_whatsapp_message(sender_phone, response.answer_text)

            return {"status": "voice_processed", "transcription": transcribed_text}

        # ===== HANDLE IMAGE (Future: OCR) =====
        elif message_type == "image":
            await send_whatsapp_message(
                sender_phone,
                "📷 Image support coming soon! Please send text or voice message."
            )
            return {"status": "image_not_supported"}

        return {"status": "unknown_type", "type": message_type}

    except Exception as e:
        print(f"❌ Error processing message: {e}")
        return {"status": "error", "message": str(e)}


# ============ SEND TEXT MESSAGE ============
async def send_whatsapp_message(to_phone: str, message: str):
    """Send text message via WhatsApp Cloud API"""
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_phone,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(WHATSAPP_API_URL, json=payload, headers=headers)
        result = response.json()
        print(f"📤 Message sent to {to_phone}: {response.status_code}")
        return result


# ============ DOWNLOAD MEDIA FROM WHATSAPP ============
async def download_whatsapp_media(media_id: str) -> bytes:
    """Download voice/audio/image file from WhatsApp servers"""
    headers = {"Authorization": f"Bearer {WHATSAPP_TOKEN}"}

    try:
        async with httpx.AsyncClient() as client:
            # Step 1: Get the media URL
            media_info_response = await client.get(
                f"https://graph.facebook.com/v18.0/{media_id}",
                headers=headers
            )
            media_info = media_info_response.json()
            media_url = media_info.get("url")

            if not media_url:
                print(f"❌ No URL in media info: {media_info}")
                return None

            # Step 2: Download the actual file
            media_response = await client.get(media_url, headers=headers)

            if media_response.status_code == 200:
                print(f"✅ Downloaded media: {len(media_response.content)} bytes")
                return media_response.content
            else:
                print(f"❌ Download failed: {media_response.status_code}")
                return None

    except Exception as e:
        print(f"❌ Media download error: {e}")
        return None


# ============ TEST ENDPOINT ============
@router.get("/test-send")
async def test_send_message(phone: str, message: str = "Hello from Shiksha Mitra! 🎓"):
    """Test endpoint to send a message manually"""
    result = await send_whatsapp_message(phone, message)
    return {"status": "sent", "result": result}
