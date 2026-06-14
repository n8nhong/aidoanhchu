export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const CUSTOM_WATERMARK_URL = "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="orangeCorona" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff9f43"/><stop offset="100%" stop-color="#ee5253"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#orangeCorona)"/><circle cx="50" cy="50" r="43" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.35"/><circle cx="50" cy="18" r="2" fill="#ffffff" opacity="0.9"/><text x="50" y="44" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="21" letter-spacing="0.5" text-anchor="middle" dominant-baseline="central">AI</text><text x="50" y="66" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="7.5" letter-spacing="1.1" text-anchor="middle" dominant-baseline="central">DOANH CHU</text></svg>`);
export const WATERMARK_POSITION: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' = 'bottom-right'; // Đổi vị trí nếu logo Gemini nằm ở góc khác

export const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        // Chèn watermark để che biểu tượng Gemini
        const wmImg = new window.Image();
        wmImg.src = CUSTOM_WATERMARK_URL;
        wmImg.onload = () => {
          const padding = 16;
          // Tự động scale kích thước watermark dạng tròn dựa trên ảnh, từ 60px đến 125px
          let wmW = Math.max(60, Math.min(125, width * 0.12)); 
          let wmH = wmW; // Tỷ lệ 1:1 cho logo hình tròn
          
          let wmX = padding;
          let wmY = height - wmH - padding;
          
          if (WATERMARK_POSITION === 'bottom-right') {
            wmX = width - wmW - padding;
          } else if (WATERMARK_POSITION === 'top-left') {
            wmY = padding;
          } else if (WATERMARK_POSITION === 'top-right') {
            wmX = width - wmW - padding;
            wmY = padding;
          }

          ctx.drawImage(wmImg, wmX, wmY, wmW, wmH);
          const compressedBase64 = canvas.toDataURL('image/webp', 0.85);
          resolve(compressedBase64);
        };
        wmImg.onerror = () => {
          const compressedBase64 = canvas.toDataURL('image/webp', 0.85);
          resolve(compressedBase64);
        };
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export function setItemResilient(key: string, valueStr: string): boolean {
  try {
    localStorage.removeItem(key); // Free up exact same key space first to avoid V8 allocation lock
    localStorage.setItem(key, valueStr);
    try {
      if (['affili_online_products', 'affili_products', 'affili_gift_materials', 'affili_buyers', 'affili_categories', 'affili_social_channels', 'affili_guaranteed_win_spins', 'affili_gift_claim_link', 'affili_gift_campaigns'].includes(key)) {
        let payloadValue: any = valueStr;
        try {
           payloadValue = JSON.parse(valueStr);
        } catch (err) {}
        // Only sync to server if the user is an admin. Guests should not overwrite server state with their initial local state.
        const isAdm = localStorage.getItem('isAdminLoggedIn') === 'true';
        if (isAdm) {
          fetch('/api/sync-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [key]: payloadValue })
          }).catch(() => {});
        }
      }
    } catch (e) {}
    return true;
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn(`LocalStorage quota exceeded for key "${key}". Attempting to prune old auto-generated documents to free space...`);
      
      try {
        // Prune affili_online_products
        const opSaved = localStorage.getItem('affili_online_products');
        if (opSaved) {
          try {
            let ops = JSON.parse(opSaved);
            if (Array.isArray(ops)) {
              let changed = false;

              const autoGenOps = ops.filter(op => op.isAutoGeneratedWebDoc);
              if (autoGenOps.length > 1) {
                // Keep only the most recent 1
                const keepCount = 1;
                const sorted = [...autoGenOps].sort((a: any, b: any) => {
                  const idA = String(a.id).replace('op_gen_', '').replace('gen_', '');
                  const idB = String(b.id).replace('op_gen_', '').replace('gen_', '');
                  return Number(idB) - Number(idA); // descending
                });
                const keepIds = new Set(sorted.slice(0, keepCount).map((o: any) => o.id));
                
                ops = ops.filter(op => !op.isAutoGeneratedWebDoc || keepIds.has(op.id));
                changed = true;
              }
              if (changed) {
                localStorage.setItem('affili_online_products', JSON.stringify(ops));
              }
            }
          } catch (err) {
            console.error("Failed to prune affili_online_products", err);
          }
        }

        // Prune affili_gift_materials
        const gmSaved = localStorage.getItem('affili_gift_materials');
        if (gmSaved) {
          try {
            let gms = JSON.parse(gmSaved);
            if (Array.isArray(gms)) {
              let changed = false;

              const autoGenGms = gms.filter(gm => gm.isAutoGeneratedWebDoc);
              if (autoGenGms.length > 1) {
                const keepCount = 1;
                const sorted = [...autoGenGms].sort((a: any, b: any) => {
                  const idA = String(a.id).replace('gen_', '');
                  const idB = String(b.id).replace('gen_', '');
                  return Number(idB) - Number(idA); // descending
                });
                const keepIds = new Set(sorted.slice(0, keepCount).map((g: any) => g.id));
                
                gms = gms.filter(gm => !gm.isAutoGeneratedWebDoc || keepIds.has(gm.id));
                changed = true;
              }
              if (changed) {
                localStorage.setItem('affili_gift_materials', JSON.stringify(gms));
              }
            }
          } catch (err) {
            console.error("Failed to prune affili_gift_materials", err);
          }
        }

        // Now try again to set the item
        localStorage.removeItem(key);
        localStorage.setItem(key, valueStr);
        console.log(`Successfully saved key "${key}" after pruning old auto-generated docs.`);
        try {
          if (['affili_online_products', 'affili_products', 'affili_gift_materials', 'affili_buyers', 'affili_categories', 'affili_social_channels', 'affili_guaranteed_win_spins', 'affili_gift_claim_link', 'affili_gift_campaigns'].includes(key)) {
            let payloadValue: any = valueStr;
            try { payloadValue = JSON.parse(valueStr); } catch (e) {}
            // Only sync to server if the user is an admin. Guests should not overwrite server state.
            const isAdm = localStorage.getItem('isAdminLoggedIn') === 'true';
            if (isAdm) {
              fetch('/api/sync-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: payloadValue })
              }).catch(() => {});
            }
          }
        } catch (e) {}
        return true;
      } catch (retryError) {
        // If it STILL fails, let's try extreme pruning: remove ALL isAutoGeneratedWebDoc
        try {
          console.warn("Pruning failed to free enough space. Performing aggressive pruning...");
          
          let opSaved = localStorage.getItem('affili_online_products');
          if (opSaved) {
            let ops = JSON.parse(opSaved);
            if (Array.isArray(ops)) {
              ops = ops.filter((op: any) => !op.isAutoGeneratedWebDoc);
              localStorage.setItem('affili_online_products', JSON.stringify(ops));
            }
          }

          let gmSaved = localStorage.getItem('affili_gift_materials');
          if (gmSaved) {
            let gms = JSON.parse(gmSaved);
            if (Array.isArray(gms)) {
              gms = gms.filter((gm: any) => !gm.isAutoGeneratedWebDoc);
              localStorage.setItem('affili_gift_materials', JSON.stringify(gms));
            }
          }

          // Let's try again
          localStorage.removeItem(key);
          localStorage.setItem(key, valueStr);
          console.log(`Aggressive pruning allowed saving key "${key}".`);
          return true;
        } catch (aggrError) {
          console.error(`Aggressive pruning still not enough for key "${key}":`, aggrError);
          // Last resort: we try to write anyway, but wrap in a try-catch so it won't crash the React context
          try {
             // Instead of wiping everything indiscriminately (which causes data loss across tabs),
             // We only remove large cached data that is safe to lose or rebuild.
             const keysToRemove = [];
             for (let i = 0; i < localStorage.length; i++) {
               const k = localStorage.key(i);
               if (k && !['isAdminLoggedIn', 'adminRole', 'client_license_token', 'affili_gemini_keys', 'affili_gift_campaigns', 'affili_categories', 'supabase_url', 'supabase_key', 'custom_brand', 'admin_facebook', 'admin_zalo', 'admin_tiktok', 'affili_social_channels', 'affili_products', 'affili_buyers', 'affili_online_products', 'affili_gift_materials'].includes(k) && k !== key) {
                 keysToRemove.push(k);
               }
             }
             keysToRemove.forEach(k => localStorage.removeItem(k));
             
             // If key is affili_gift_materials, do not wipe affili_online_products!
             // We only wipe what we pushed. If it still fails, we have no choice but to throw.
             localStorage.removeItem(key);
             localStorage.setItem(key, valueStr);
             return true;
          } catch (lastErr) {
             console.error("Critical: Complete localStorage failure. Data cannot be persisted.", lastErr);
             return false;
          }
        }
      }
    } else {
      console.error(`Failed to set item in localStorage for key "${key}":`, e);
      return false;
    }
  }
}
