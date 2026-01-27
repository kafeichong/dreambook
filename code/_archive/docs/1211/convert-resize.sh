#!/bin/bash
#chmod +x convert.sh
#./convert.sh
  # 配置参数
  QUALITY=90
  WIDTH=2560
  HEIGHT=1440

  echo "🚀 开始批量处理..."
  echo "目标尺寸: ${WIDTH}×${HEIGHT}"
  echo "质量: ${QUALITY}"
  echo "---"

  # 遍历所有 PNG
  for file in input/*.png; do
    # 检查文件是否存在
    if [ ! -f "$file" ]; then
      echo "⚠️  input 文件夹中没有 PNG 文件"
      exit 1
    fi

    # 获取文件名
    filename=$(basename "$file" .png)

    # 方法1：使用 cwebp（推荐，速度快）
    cwebp -resize $WIDTH $HEIGHT -q $QUALITY "$file" -o
  "output/${filename}.webp"

    # 获取输出文件大小
    filesize=$(du -h "output/${filename}.webp" | cut -f1)

    # 显示进度
    echo "✅ $filename.png → $filename.webp (${filesize})"
  done

  echo "---"
  echo "🎉 完成！共处理 $(ls input/*.png 2>/dev/null | wc -l) 个文件"
  echo "📁 输出目录: output/"