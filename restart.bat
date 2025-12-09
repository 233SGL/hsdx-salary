@echo off
echo 正在重启服务器...
echo.

echo 1. 终止现有进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 终止PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo 终止PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)
echo.
echo 2. 等待端口释放
timeout /t 2 /nobreak >nul
echo.
echo 3. 启动后端服务器
start "后端服务器" cmd /k "cd /d %~dp0 && npm run server"
echo.
echo 4. 等待后端启动
timeout /t 5 /nobreak >nul
echo.
echo 5. 启动前端服务器
start "前端服务器" cmd /k "cd /d %~dp0 && npm run dev"
echo.
echo 服务器重启完成！
echo 后端: http://localhost:3000
echo 前端: http://localhost:5173
pause