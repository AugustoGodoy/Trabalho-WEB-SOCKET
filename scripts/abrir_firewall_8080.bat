@echo off
chcp 65001 >nul
title Liberar porta 8080 - Chat Tornado
echo.
echo ============================================================
echo  Este script cria regras no Firewall do Windows para:
echo   - TCP porta 8080 (servidor do chat)
echo   - Entrada permitida para o Python que esta no PATH
echo.
echo  OBRIGATORIO: clique com o botao direito neste arquivo e
echo  escolha "Executar como administrador".
echo ============================================================
echo.
pause

netsh advfirewall firewall add rule name="Tornado Chat TCP 8080" dir=in action=allow protocol=TCP localport=8080
if errorlevel 1 (
  echo Falha ao criar regra da porta. Talvez a regra ja exista - tudo bem.
) else (
  echo Regra da porta 8080 criada.
)

for /f "delims=" %%i in ('where python 2^>nul') do (
  netsh advfirewall firewall add rule name="Tornado Chat Python entrada" dir=in action=allow program="%%i" enable=yes
  if errorlevel 1 (
    echo Aviso: nao foi possivel criar regra para %%i
  ) else (
    echo Regra para Python criada: %%i
  )
  goto :done_py
)
echo Aviso: comando "where python" nao encontrou o Python no PATH.
:done_py

echo.
echo Pronto. Reinicie o servidor (python server.py) e teste de novo.
echo.
pause
