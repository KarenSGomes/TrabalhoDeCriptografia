export function useChatCrypto() {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const generateKeyPair = async () => {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt']
        );

        const publicKey = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
        const privateKey = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

        return {
            publicKey: publicKey,
            privateKey: privateKey,
        };
    }

    const importPublicRSAKey = async(key: any) => {
        return await window.crypto.subtle.importKey(
            "jwk",
            key,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["encrypt"]
        );
    }

    const importPrivateRSAKey = async (key: any) => {
        return await window.crypto.subtle.importKey(
            "jwk",
            key,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["decrypt"]
        );
    }

    const encryptAESKeyWithRSA = async (aesBase64: any, publicKey: any) => {
        const encrypted = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            encoder.encode(aesBase64)
        );

        return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    }

    const decryptAESKeyWithRSA = async (encryptedBase64: any, privateKey: any) => {
        const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

        const decrypted = await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedData
        );

        return decoder.decode(decrypted); // volta AES base64
    }
    

    const generateAESKey = async () => {
        return await crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    const exportAESKey = async (key: any) => {
        const raw = await crypto.subtle.exportKey("raw", key);
        return btoa(String.fromCharCode(...new Uint8Array(raw)));
    }

    const importAESKey = async (base64Key: any) => {
        const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));

        return await crypto.subtle.importKey(
            "raw",
            raw,
            "AES-GCM",
            true,
            ["encrypt", "decrypt"]
        );
    }

    const encryptMessage = async (text: any, key: any) => {
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv,
            },
            key,
            encoder.encode(text)
        );

        return {
            cipherText: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
            iv: btoa(String.fromCharCode(...iv)),
        }
    }

    const decryptMessage = async (cipherText: any, iv: any, key: any) => {
        const encryptedData = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
        const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

        const decrypted = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: ivData,
            },
            key,
            encryptedData
        );

        return decoder.decode(decrypted);
    }


    const saveAESKeyToLocal = (chatId: any, base64Key: any) => {
        localStorage.setItem(`aes_${chatId}`, base64Key);
    }

    const getAESKeyFromLocal = (chatId: any) => {
        return localStorage.getItem(`aes_${chatId}`);
    }

    return {
        generateKeyPair,
        importPublicRSAKey,
        importPrivateRSAKey,
        encryptAESKeyWithRSA,
        decryptAESKeyWithRSA,
        generateAESKey,
        exportAESKey,
        importAESKey,
        encryptMessage,
        decryptMessage,
        saveAESKeyToLocal,
        getAESKeyFromLocal,
    }
}