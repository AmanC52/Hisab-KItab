using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Windows.Forms;
using System.Drawing;

namespace HisabKitab
{
    static class Program
    {
        private static HttpListener _listener;
        private static int _port = 31888;
        private static string _appDir;
        private static bool _isRunning = true;

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            _appDir = AppDomain.CurrentDomain.BaseDirectory;

            // Find an open port
            FindAvailablePort();

            // Start local HTTP server
            StartLocalServer();

            // Launch Desktop Application Window
            LaunchDesktopWindow();
        }

        private static void FindAvailablePort()
        {
            for (int p = 31888; p < 32000; p++)
            {
                try
                {
                    var test = new HttpListener();
                    test.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", p));
                    test.Start();
                    test.Stop();
                    _port = p;
                    break;
                }
                catch
                {
                    // Try next port
                }
            }
        }

        private static void StartLocalServer()
        {
            try
            {
                _listener = new HttpListener();
                _listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", _port));
                _listener.Start();

                var thread = new Thread(ServerWorker) { IsBackground = true };
                thread.Start();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Server start error: " + ex.Message, "Hisab Kitab Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static void ServerWorker()
        {
            while (_isRunning && _listener != null && _listener.IsListening)
            {
                try
                {
                    var context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem((c) => HandleRequest((HttpListenerContext)c), context);
                }
                catch
                {
                    if (!_isRunning) break;
                }
            }
        }

        private static void HandleRequest(HttpListenerContext context)
        {
            try
            {
                var req = context.Request;
                var resp = context.Response;

                // Add CORS headers for local loopback
                resp.AddHeader("Access-Control-Allow-Origin", "*");
                resp.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                resp.AddHeader("Access-Control-Allow-Headers", "Content-Type");

                if (req.HttpMethod == "OPTIONS")
                {
                    resp.StatusCode = 200;
                    resp.Close();
                    return;
                }

                string urlPath = req.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(urlPath)) urlPath = "index.html";

                // API: Save DBMS file directly to hard drive
                if (urlPath == "api/save_dbms" && req.HttpMethod == "POST")
                {
                    using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
                    {
                        string body = reader.ReadToEnd();
                        string dbPath = Path.Combine(_appDir, "hisab_kitab_dbms.json");
                        File.WriteAllText(dbPath, body, Encoding.UTF8);
                    }
                    byte[] ok = Encoding.UTF8.GetBytes("{\"success\":true}");
                    resp.ContentType = "application/json";
                    resp.OutputStream.Write(ok, 0, ok.Length);
                    resp.Close();
                    return;
                }

                // API: Load DBMS file from hard drive
                if (urlPath == "api/load_dbms" && req.HttpMethod == "GET")
                {
                    string dbPath = Path.Combine(_appDir, "hisab_kitab_dbms.json");
                    string json = File.Exists(dbPath) ? File.ReadAllText(dbPath, Encoding.UTF8) : "{}";
                    byte[] bytes = Encoding.UTF8.GetBytes(json);
                    resp.ContentType = "application/json";
                    resp.OutputStream.Write(bytes, 0, bytes.Length);
                    resp.Close();
                    return;
                }

                // Serve static files from app directory
                string localFilePath = Path.Combine(_appDir, urlPath.Replace('/', Path.DirectorySeparatorChar));

                // Also check www subdirectory if not found in root
                if (!File.Exists(localFilePath))
                {
                    string wwwPath = Path.Combine(_appDir, "www", urlPath.Replace('/', Path.DirectorySeparatorChar));
                    if (File.Exists(wwwPath)) localFilePath = wwwPath;
                }

                if (File.Exists(localFilePath))
                {
                    byte[] buffer = File.ReadAllBytes(localFilePath);
                    string ext = Path.GetExtension(localFilePath).ToLower();

                    if (ext == ".html") resp.ContentType = "text/html; charset=utf-8";
                    else if (ext == ".js") resp.ContentType = "application/javascript; charset=utf-8";
                    else if (ext == ".json") resp.ContentType = "application/json; charset=utf-8";
                    else if (ext == ".png") resp.ContentType = "image/png";
                    else if (ext == ".ico") resp.ContentType = "image/x-icon";
                    else if (ext == ".css") resp.ContentType = "text/css; charset=utf-8";
                    else resp.ContentType = "application/octet-stream";

                    resp.ContentLength64 = buffer.Length;
                    resp.OutputStream.Write(buffer, 0, buffer.Length);
                }
                else
                {
                    resp.StatusCode = 404;
                    byte[] notFound = Encoding.UTF8.GetBytes("404 Not Found");
                    resp.OutputStream.Write(notFound, 0, notFound.Length);
                }
                resp.Close();
            }
            catch
            {
                try { context.Response.Close(); } catch { }
            }
        }

        private static void LaunchDesktopWindow()
        {
            string url = string.Format("http://127.0.0.1:{0}/index.html", _port);
            string edgePath = FindEdgeBrowser();

            if (!string.IsNullOrEmpty(edgePath))
            {
                // Launch Microsoft Edge in App Mode (Kiosk / Desktop App Window)
                string dataDir = Path.Combine(_appDir, ".desktop_cache");
                var psi = new ProcessStartInfo
                {
                    FileName = edgePath,
                    Arguments = string.Format("--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1200,820", url, dataDir),
                    UseShellExecute = false
                };

                try
                {
                    using (var proc = Process.Start(psi))
                    {
                        if (proc != null)
                        {
                            proc.WaitForExit();
                        }
                    }
                }
                catch
                {
                    // Fallback to default browser if app mode fails
                    Process.Start(url);
                }
                finally
                {
                    _isRunning = false;
                    try { _listener.Stop(); } catch { }
                }
            }
            else
            {
                // Fallback: Open in default browser or WinForms
                try
                {
                    Process.Start(url);
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Could not launch browser: " + ex.Message);
                }
            }
        }

        private static string FindEdgeBrowser()
        {
            string[] possiblePaths = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe")
            };

            foreach (var path in possiblePaths)
            {
                if (File.Exists(path)) return path;
            }
            return null;
        }
    }
}
