import type { Platform, Quality } from '../types';
import { buildFileUrl } from '../api';

// 检测是否在 Tauri 环境中运行
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

/**
 * 根据音质获取文件扩展名
 */
function getFileExtension(quality: Quality): string {
  switch (quality) {
    case 'flac':
    case 'flac24bit':
      return 'flac';
    case '128k':
    case '320k':
    default:
      return 'mp3';
  }
}

/**
 * 生成文件名
 */
function generateFileName(songName: string, artist: string | undefined, quality: Quality): string {
  const sanitize = (str: string) => str.replace(/[<>:"/\\|?*]/g, '_').trim();
  const name = sanitize(songName);
  const artistName = artist ? ` - ${sanitize(artist)}` : '';
  const extension = getFileExtension(quality);
  return `${name}${artistName} [${quality}].${extension}`;
}

/**
 * 在 Web 环境中下载文件
 * 由于 API 返回 302 重定向，且真实文件 URL 可能存在 CORS 限制
 * 我们尝试两种方式：1. fetch + blob（如果支持） 2. 直接链接下载（作为 fallback）
 */
async function downloadInWeb(url: string, filename: string, source?: Platform): Promise<void> {
  try {
    // 首先尝试使用 fetch 下载（浏览器会自动跟随 302 重定向）
    try {
      const headers: HeadersInit = {};
      
      // 酷我平台可能需要特定的请求头
      if (source === 'kuwo') {
        headers['Referer'] = 'https://www.kuwo.cn/';
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      }
      
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        mode: 'cors',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // 清理 blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      return; // 成功下载，直接返回
    } catch (fetchError) {
      // 如果 fetch 失败（可能是 CORS 问题），尝试使用直接链接下载
      console.warn('Fetch 方式下载失败，尝试直接链接下载:', fetchError);
      
      // 使用 <a> 标签直接指向 API URL，让浏览器处理 302 重定向
      // 注意：这种方法可能无法设置自定义文件名，但至少可以下载文件
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // 虽然可能不生效，但保留以防浏览器支持
      // 设置 target="_blank" 以防止在 CORS 重定向导致下载失败（变为播放）时覆盖当前页面
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // 如果是网络错误（通常是CORS问题），直接链接下载可能成功，但文件名可能不正确
      // 由于文件实际上已经开始下载了，我们不抛出错误，而是静默完成
      // 在Web环境中，跨域重定向的文件名由服务器决定，这是浏览器安全限制
      if (fetchError instanceof TypeError && (
        fetchError.message.includes('fetch') || 
        fetchError.message.includes('Failed to fetch') ||
        fetchError.message.includes('NetworkError')
      )) {
        // 文件已经开始下载，只是文件名可能不正确
        // 静默完成，不抛出错误
        return;
      }
      // 其他错误直接抛出
      throw fetchError;
    }
  } catch (error) {
    throw new Error(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 在 Tauri 环境中下载文件
 */
async function downloadInTauri(url: string, filename: string, quality: Quality, source?: Platform): Promise<void> {
  try {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const { writeFile } = await import('@tauri-apps/plugin-fs');
    
    // 根据音质确定文件扩展名
    const extension = getFileExtension(quality);
    
    // 打开文件保存对话框
    const filePath = await save({
      defaultPath: filename,
      filters: [
        {
          name: extension === 'flac' ? 'FLAC 音频文件' : 'MP3 音频文件',
          extensions: [extension],
        },
        {
          name: '所有音频文件',
          extensions: ['mp3', 'flac', 'm4a', 'aac', 'ogg', 'wav'],
        },
      ],
    });
    
    if (!filePath) {
      throw new Error('用户取消了保存');
    }
    
    // 设置请求头（酷我平台可能需要特定的请求头）
    const headers: HeadersInit = {};
    if (source === 'kuwo') {
      headers['Referer'] = 'https://www.kuwo.cn/';
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }
    
    // 使用标准 fetch 下载文件（在 Tauri 中会自动跟随 302 重定向）
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }
    
    // 获取二进制数据
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    
    // 写入文件 - 使用 writeFile 和 Uint8Array
    await writeFile(filePath, data);
  } catch (error) {
    throw new Error(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 下载歌曲
 * @param source 平台
 * @param id 歌曲 ID
 * @param songName 歌曲名称
 * @param artist 艺术家名称
 * @param quality 音质
 */
export async function downloadSong(
  source: Platform,
  id: string,
  songName: string,
  artist: string | undefined,
  quality: Quality = '320k',
): Promise<void> {
  // 构建下载 URL
  const downloadUrl = buildFileUrl(source, id, 'url', quality);
  
  // 生成文件名
  const filename = generateFileName(songName, artist, quality);
  
  // 根据环境选择下载方式
  if (isTauri) {
    await downloadInTauri(downloadUrl, filename, quality, source);
  } else {
    await downloadInWeb(downloadUrl, filename, source);
  }
}

