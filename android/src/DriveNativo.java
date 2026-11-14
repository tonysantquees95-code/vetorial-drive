package tech.vetorial.drive;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;

/** Baixa arquivos grandes direto para Download/VetorialDrive, sem encher a memória do app. */
@CapacitorPlugin(name = "VetorialDrive")
public class DriveNativo extends Plugin {
    private static volatile boolean cancelar = false;

    private static String tipo(String nome) {
        int i = nome.lastIndexOf('.');
        String t = i < 0 ? null : MimeTypeMap.getSingleton().getMimeTypeFromExtension(nome.substring(i + 1).toLowerCase(Locale.ROOT));
        return t == null ? "application/octet-stream" : t;
    }

    @PluginMethod
    public void baixar(final PluginCall call) {
        final String url = call.getString("url", ""), token = call.getString("token", ""), nome = call.getString("nome", "arquivo");
        if (!url.startsWith("https://venus-servidor.tonysantquees95.workers.dev/drive/arquivo/")) { call.reject("Endereço não permitido."); return; }
        cancelar = false;
        getBridge().execute(new Runnable() {
            @Override public void run() {
                HttpURLConnection c = null;
                Uri destino = null;
                ContentResolver cr = getContext().getContentResolver();
                try {
                    c = (HttpURLConnection) new URL(url).openConnection();
                    c.setConnectTimeout(15000); c.setReadTimeout(60000);
                    c.setRequestProperty("Authorization", "Bearer " + token);
                    int st = c.getResponseCode();
                    if (st >= 400) throw new Exception(st == 404 ? "Arquivo não encontrado no Drive." : "O servidor respondeu " + st + ".");
                    long total = c.getContentLengthLong(), feito = 0, ultimo = 0;
                    OutputStream saida;
                    File arquivo = null;
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues v = new ContentValues();
                        v.put(MediaStore.Downloads.DISPLAY_NAME, nome);
                        v.put(MediaStore.Downloads.MIME_TYPE, tipo(nome));
                        v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/VetorialDrive");
                        v.put(MediaStore.Downloads.IS_PENDING, 1);
                        destino = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                        if (destino == null) throw new Exception("Não consegui criar o arquivo em Downloads.");
                        saida = cr.openOutputStream(destino);
                    } else {
                        File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "VetorialDrive");
                        dir.mkdirs();
                        arquivo = new File(dir, nome);
                        saida = new FileOutputStream(arquivo);
                        destino = Uri.fromFile(arquivo);
                    }
                    try (InputStream in = c.getInputStream(); OutputStream o = saida) {
                        byte[] b = new byte[64 * 1024]; int l;
                        while ((l = in.read(b)) > 0) {
                            if (cancelar) throw new Exception("Cancelado.");
                            o.write(b, 0, l); feito += l;
                            long agora = System.currentTimeMillis();
                            if (agora - ultimo > 300) { ultimo = agora; JSObject d = new JSObject(); d.put("feito", feito); d.put("total", total); notifyListeners("progresso", d); }
                        }
                    }
                    if (total > 0 && feito < total) throw new Exception("A conexão caiu antes de terminar.");
                    if (Build.VERSION.SDK_INT >= 29) { ContentValues v = new ContentValues(); v.put(MediaStore.Downloads.IS_PENDING, 0); cr.update(destino, v, null, null); }
                    JSObject r = new JSObject(); r.put("uri", destino.toString());
                    call.resolve(r);
                } catch (Exception e) {
                    if (destino != null) { try { cr.delete(destino, null, null); } catch (Exception ignora) { } }
                    call.reject(e.getMessage() == null ? e.toString() : e.getMessage());
                } finally { if (c != null) c.disconnect(); }
            }
        });
    }

    @PluginMethod
    public void cancelar(PluginCall call) { cancelar = true; call.resolve(); }

    @PluginMethod
    public void abrir(PluginCall call) {
        try {
            Uri u = Uri.parse(call.getString("uri", ""));
            Intent i = new Intent(Intent.ACTION_VIEW).setDataAndType(u, tipo(call.getString("nome", ""))).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) { call.reject("Nenhum app para abrir esse tipo de arquivo."); }
    }
}
