/**
 * 系统信息检测脚本
 * 用于验证 Windows 平台标识
 */

const os = require('os');

console.log('\n========== 系统信息 ==========\n');

console.log('1. process.platform:', process.platform);
console.log('   说明:', process.platform === 'win32' ? '✅ Windows 系统（包括 64 位）' : '其他系统');

console.log('\n2. process.arch:', process.arch);
console.log('   说明:',
  process.arch === 'x64' ? '✅ 64 位架构' :
  process.arch === 'ia32' ? '⚠️  32 位架构' :
  '其他架构');

console.log('\n3. os.platform():', os.platform());
console.log('   （与 process.platform 相同）');

console.log('\n4. os.arch():', os.arch());
console.log('   （与 process.arch 相同）');

console.log('\n5. os.type():', os.type());
console.log('   说明:',
  os.type() === 'Windows_NT' ? '✅ Windows NT 系统' :
  os.type());

console.log('\n6. os.release():', os.release());
console.log('   Windows 版本号');

console.log('\n7. os.version():', os.version());
console.log('   完整版本信息');

console.log('\n========== 结论 ==========\n');

if (process.platform === 'win32' && process.arch === 'x64') {
  console.log('✅ 你的系统是：Windows 64 位');
  console.log('✅ 代码中 process.platform === "win32" 的判断是正确的');
  console.log('✅ 这不是指 32 位系统，而是所有 Windows 系统的统一标识');
} else if (process.platform === 'win32' && process.arch === 'ia32') {
  console.log('⚠️  你的系统是：Windows 32 位');
  console.log('⚠️  建议使用 64 位系统以获得更好的性能');
} else {
  console.log('❌ 你的系统不是 Windows');
  console.log('   平台:', process.platform);
  console.log('   架构:', process.arch);
}

console.log('\n========== TabTip.exe 路径 ==========\n');

if (process.platform === 'win32') {
  const { execSync } = require('child_process');
  const fs = require('fs');

  const possiblePaths = [
    'C:\\Program Files\\Common Files\\microsoft shared\\ink\\TabTip.exe',
    'C:\\Program Files (x86)\\Common Files\\microsoft shared\\ink\\TabTip.exe'
  ];

  possiblePaths.forEach(path => {
    if (fs.existsSync(path)) {
      console.log('✅ 找到:', path);
    } else {
      console.log('❌ 未找到:', path);
    }
  });

  console.log('\n注意：');
  console.log('- 64 位系统通常使用第一个路径');
  console.log('- 32 位程序在 64 位系统上可能使用第二个路径（WOW64）');
}

console.log('\n========== Electron 环境信息 ==========\n');

if (typeof process.versions.electron !== 'undefined') {
  console.log('✅ 运行在 Electron 环境');
  console.log('Electron 版本:', process.versions.electron);
  console.log('Chrome 版本:', process.versions.chrome);
  console.log('Node.js 版本:', process.versions.node);
} else {
  console.log('⚠️  运行在纯 Node.js 环境（非 Electron）');
  console.log('Node.js 版本:', process.version);
}

console.log('\n====================================\n');
