import fs from 'fs';
const files = ['src/components/CartDrawer.tsx', 'src/utils/giftSlidesData.ts'];
files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/phễu/g, 'thu hút');
    content = content.replace(/Phễu/g, 'Thu Hút');
    content = content.replace(/PHỄU/g, 'THU HÚT');
    fs.writeFileSync(file, content, 'utf-8');
  }
});
console.log('Done replacing!');
