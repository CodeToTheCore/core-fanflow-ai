import { useState, useEffect, useRef } from 'react'
import { Upload, Play, Pause, Music, Video, Image, Trash2, Plus, X } from 'lucide-react'
import { Button, Badge, Modal } from '../components/ui/Button'
import { mediaService } from '../services/mediaService'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export default function MediaStudio() {
  const [media, setMedia] = useState([])
  const [tab, setTab] = useState('audio')
  const [uploading, setUploading] = useState(false)
  const [uploadModal, setUploadModal] = useState(false)
  const [playing, setPlaying] = useState(null)
  const [form, setForm] = useState({ title: '', albumName: '', isPublic: true })
  const [selectedFile, setSelectedFile] = useState(null)
  const fileRef = useRef()
  const audioRef = useRef()

  useEffect(() => {
    loadMedia()
  }, [tab])

  const loadMedia = () => {
    mediaService.getAll(tab).then(setMedia).catch(() => setMedia([]))
  }

  async function handleUpload() {
    if (!selectedFile || !form.title) return toast.error('File and Title required')
    setUploading(true)
    try {
      await mediaService.upload(selectedFile, { ...form, type: tab })
      toast.success('Uploaded!')
      setUploadModal(false)
      setSelectedFile(null)
      setForm({ title: '', albumName: '', isPublic: true })
      loadMedia()
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return
    try {
      await mediaService.delete(id)
      setMedia(media.filter(m => m.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  function togglePlay(item) {
    if (playing === item.id) {
      audioRef.current?.pause()
      setPlaying(null)
    } else {
      audioRef.current.src = `${API_BASE}${item.url}`
      audioRef.current.play()
      setPlaying(item.id)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          
          {[
            { id: 'audio', icon: Music, label: 'Music' },
            { id: 'video', icon: Video, label: 'Videos' },
            { id: 'images', icon: Image, label: 'Images' }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${tab === t.id ? 'bg-orange-500 text-white' : 'bg-[#1A1A26] text-gray-400'}`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={() => setUploadModal(true)}>Upload {tab}</Button>
      </div>

      {/* Grid Display */}
      <div className={tab === 'audio' ? 'space-y-3' : 'grid grid-cols-2 md:grid-cols-3 gap-4'}>
        {media.map((item) => (
          <div key={item.id} className="group relative bg-[#1A1A26] border border-[#2A2A3A] rounded-xl overflow-hidden p-4">
            {tab === 'audio' ? (
              <div className="flex items-center gap-4">
                <button onClick={() => togglePlay(item)} className="p-3 bg-orange-500 rounded-full text-white">
                  {playing === item.id ? <Pause size={18}/> : <Play size={18}/>}
                </button>
                <div className="flex-1">
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.album_name || 'Single'}</p>
                </div>

               {/* THIS IS THE NEW EXPORT BUTTON */}
                <a 
                  href={`${API_BASE}${item.url}`} 
                  download={`${item.title}.mp3`}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-[10px] font-bold text-white transition-colors"
                 >
                EXPORT
                </a>


                 </div>
            ) : tab === 'video' ? (
              <video src={`${API_BASE}${item.url}`} className="w-full aspect-video rounded-lg mb-2" controls />
            ) : (
              <img src={`${API_BASE}${item.url}`} className="w-full aspect-square object-cover rounded-lg mb-2" alt="" />
            )}
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-gray-300">{tab !== 'audio' && item.title}</span>
              <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-500 p-1">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal remains largely same but ensures type is passed */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title={`Upload to ${tab}`}>
        <div className="space-y-4">
          <input type="text" placeholder="Title" className="w-full p-2 bg-[#12121A] border border-[#2A2A3A] text-white rounded"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <div onClick={() => fileRef.current.click()} className="p-10 border-2 border-dashed border-[#2A2A3A] text-center cursor-pointer text-gray-400">
            {selectedFile ? selectedFile.name : "Select File"}
            <input ref={fileRef} type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
          </div>
          <Button variant="primary" className="w-full" onClick={handleUpload} loading={uploading}>Start Upload</Button>
        </div>
      </Modal>
    </div>
  )
}















// import { useState, useEffect, useRef } from 'react'
// import { Upload, Play, Pause, Music, Video, Image, Trash2, Plus, X } from 'lucide-react'
// import { FaSpotify } from 'react-icons/fa'
// import { Button, Badge, Modal } from '../components/ui/Button'
// import { mediaService } from '../services/mediaService'
// import toast from 'react-hot-toast'

// const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

// export default function MediaStudio() {
//   const [media, setMedia] = useState([])
//   const [tab, setTab] = useState('audio')
//   const [uploading, setUploading] = useState(false)
//   const [progress, setProgress] = useState(0)
//   const [uploadModal, setUploadModal] = useState(false)
//   const [playing, setPlaying] = useState(null)
//   const [form, setForm] = useState({ title: '', description: '', albumName: '', isPublic: true })
//   const [selectedFile, setSelectedFile] = useState(null)
//   const fileRef = useRef()
//   const audioRef = useRef()

//   useEffect(() => {
//     mediaService.getAll(tab).then(setMedia).catch(() => setMedia([]))
//   }, [tab])

//   async function handleUpload() {
//     if (!selectedFile) return toast.error('Select a file first')
//     if (!form.title) return toast.error('Add a title')
//     setUploading(true)
//     try {
//       const result = await mediaService.upload(selectedFile, {
//         ...form,
//         isPublic: form.isPublic ? 'true' : 'false',
//       }, setProgress)
//       setMedia(prev => [result.media, ...prev])
//       setUploadModal(false)
//       setSelectedFile(null)
//       setForm({ title: '', description: '', albumName: '', isPublic: true })
//       toast.success('Uploaded successfully!')
//     } catch (err) {
//       toast.error('Upload failed')
//     } finally {
//       setUploading(false)
//       setProgress(0)
//     }
//   }

//   function togglePlay(item) {
//     if (playing === item.id) {
//       audioRef.current?.pause()
//       setPlaying(null)
//     } else {
//       audioRef.current.src = `${API_BASE}${item.url}`
//       audioRef.current.play()
//       setPlaying(item.id)
//     }
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <audio ref={audioRef} onEnded={() => setPlaying(null)} />
      
//       <div className="flex justify-between items-center">
//         <div className="flex gap-4">
//           {['audio', 'video', 'images'].map(t => (
//             <Button key={t} variant={tab === t ? 'primary' : 'outline'} onClick={() => setTab(t)}>
//               {t.toUpperCase()}
//             </Button>
//           ))}
//         </div>
//         <Button variant="primary" onClick={() => setUploadModal(true)}>Upload New</Button>
//       </div>

//       <div className="grid gap-4">
//         {media.map((item) => (
//           <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A26] border border-[#2A2A3A]">
//             <button onClick={() => togglePlay(item)} className="p-3 bg-orange-500 rounded-full">
//               {playing === item.id ? <Pause size={20}/> : <Play size={20}/>}
//             </button>
//             <div className="flex-1">
//               <h3 className="font-bold text-white">{item.title}</h3>
//               <p className="text-sm text-gray-400">{item.album_name || 'Single'}</p>
//             </div>
//             <Badge variant={item.is_public ? 'green' : 'muted'}>{item.is_public ? 'Public' : 'Private'}</Badge>
//           </div>
//         ))}
//       </div>

//       <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Media">
//         <div className="space-y-4">
//           <input 
//             type="text" 
//             placeholder="Title" 
//             className="w-full p-2 bg-[#12121A] border border-[#2A2A3A] text-white rounded"
//             value={form.title}
//             onChange={e => setForm({...form, title: e.target.value})}
//           />
//           <div 
//             onClick={() => fileRef.current.click()}
//             className="p-10 border-2 border-dashed border-[#2A2A3A] text-center cursor-pointer"
//           >
//             {selectedFile ? selectedFile.name : "Click to select file"}
//             <input ref={fileRef} type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
//           </div>
//           <Button variant="primary" className="w-full" onClick={handleUpload} loading={uploading}>Confirm</Button>
//         </div>
//       </Modal>
//     </div>
//   )
// }




// import { Button, Badge, Modal } from '../components/ui/Button'
// import { mediaService } from '../services/mediaService'
// import toast from 'react-hot-toast'

// const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

// export default function MediaStudio() {
//   const [media, setMedia] = useState([])
//   const [tab, setTab] = useState('audio')
//   const [uploading, setUploading] = useState(false)
//   const [progress, setProgress] = useState(0)
//   const [uploadModal, setUploadModal] = useState(false)
//   const [playing, setPlaying] = useState(null)
//   const [form, setForm] = useState({ title: '', description: '', albumName: '', isPublic: true })
//   const [selectedFile, setSelectedFile] = useState(null)
//   const fileRef = useRef()
//   const audioRef = useRef()

//   useEffect(() => {
//     mediaService.getAll(tab).then(setMedia).catch(() => setMedia([]))
//   }, [tab])

//   async function handleUpload() {
//     if (!selectedFile) return toast.error('Select a file first')
//     if (!form.title) return toast.error('Add a title')
//     setUploading(true)
//     try {
//       const result = await mediaService.upload(selectedFile, {
//         ...form,
//         isPublic: form.isPublic ? 'true' : 'false',
//       }, setProgress)
//       setMedia(prev => [result.media, ...prev])
//       setUploadModal(false)
//       setSelectedFile(null)
//       setForm({ title: '', description: '', albumName: '', isPublic: true })
//       toast.success(`${tab} uploaded successfully!`)
//     } catch (err) {
//       toast.error('Upload failed — check backend is running')
//     } finally {
//       setUploading(false)
//       setProgress(0)
//     }
//   }

//   async function handleDelete(id) {
//     try {
//       await mediaService.delete(id)
//       setMedia(prev => prev.filter(m => m.id !== id))
//       toast.success('Deleted')
//     } catch {
//       toast.error('Delete failed')
//     }
//   }

//   function togglePlay(mediaItem) {
//     if (playing === mediaItem.id) {
//       audioRef.current?.pause()
//       setPlaying(null)
//     } else {
//       if (audioRef.current) {
//         audioRef.current.src = `${API_BASE}${mediaItem.url}`
//         audioRef.current.play()
//       }
//       setPlaying(mediaItem.id)
//     }
//   }

//   const tabs = [
//     { key: 'audio', icon: Music, label: 'Music' },
//     { key: 'video', icon: Video, label: 'Videos' },
//     { key: 'images', icon: Image, label: 'Images' },
//   ]

//   return (
//     <div className="space-y-5 animate-fade-in">
//       <audio ref={audioRef} onEnded={() => setPlaying(null)} />

//       <div className="flex items-center justify-between">
//         <div className="flex gap-2">
//           {tabs.map(({ key, icon: Icon, label }) => (
//             <button
//               key={key}
//               onClick={() => setTab(key)}
//               className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
//               style={{
//                 background: tab === key ? '#FF6B00' : '#1A1A26',
//                 color: tab === key ? '#fff' : '#6B6B8A',
//                 border: `1px solid ${tab === key ? '#FF6B00' : '#2A2A3A'}`,
//                 fontFamily: 'Syne, sans-serif',
//               }}
//             >
//               <Icon size={14} />
//               {label}
//             </button>
//           ))}
//         </div>
//         <Button variant="primary" icon={Plus} onClick={() => setUploadModal(true)}>
//           Upload {tab}
//         </Button>
//       </div>

//       {media.length === 0 ? (
//         <div
//           className="rounded-2xl p-16 text-center"
//           style={{ background: '#1A1A26', border: '2px dashed #2A2A3A' }}
//         >
//           <Music size={40} style={{ color: '#2A2A3A', margin: '0 auto 12px' }} />
//           <div className="text-sm" style={{ color: '#6B6B8A' }}>
//             No {tab} uploaded yet.
//           </div>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4">
//            {/* Media Display Logic Here */}
//            <p className="text-white">Media loaded: {media.length} items</p>
//         </div>
//       )}

//       <Modal open={uploadModal} onClose={() => setUploadModal(false)} title={`Upload ${tab}`} size="md">
//         <div className="space-y-4">
//           <div
//             onClick={() => fileRef.current?.click()}
//             className="rounded-xl p-8 text-center cursor-pointer"
//             style={{ border: '2px dashed #2A2A3A', background: '#12121A' }}
//           >
//             <Upload size={24} style={{ color: '#6B6B8A', margin: '0 auto 8px' }} />
//             <div className="text-sm" style={{ color: '#6B6B8A' }}>
//               {selectedFile ? selectedFile.name : `Select ${tab} file`}
//             </div>
//             <input
//               ref={fileRef}
//               type="file"
//               className="hidden"
//               onChange={e => setSelectedFile(e.target.files[0])}
//             />
//           </div>
//           <Button variant="primary" icon={Upload} onClick={handleUpload} loading={uploading} className="w-full">
//             Confirm Upload
//           </Button>
//         </div>
//       </Modal>
//     </div>
//   )
// }
