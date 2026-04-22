import { useEffect, useState } from 'react'
import { Search, Download, Send, Star } from 'lucide-react'
import { FaTwitter, FaInstagram } from "react-icons/fa"

import { Button, Badge, Modal } from '../components/ui/Button'
import { fanService } from '../services/fanService'
import { aiService } from '../services/aiService'
import toast from 'react-hot-toast'


const mockFans = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  username:
    ['melodyhunter', 'basslineQueen', 'nocturnal_wav', 'soulpatch99', 'loopmaster_k',
     'deepcuts_ty', 'rhythmsage', 'wavlength23', 'drumline_d', 'samplequeen'][i % 10] + (i > 9 ? i : ''),
  platform: i % 2 === 0 ? 'twitter' : 'instagram',
  score: Math.max(40, 97 - i * 2 + (Math.random() * 3 | 0)),
  followers: Math.floor(Math.random() * 5000) + 200,
  likes: Math.floor(Math.random() * 300) + 20,
  comments: Math.floor(Math.random() * 80) + 5,
  lastActive: `${Math.floor(Math.random() * 6) + 1}d ago`,
  tier: i < 5 ? 'superfan' : i < 12 ? 'loyal' : 'engaged',
}))

const tierColor = {
  superfan: 'orange',
  loyal: 'purple',
  engaged: 'muted',
}

export default function Superfans() {
  const [fans] = useState(mockFans)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [filter, setFilter] = useState('all')
  const [dmModal, setDmModal] = useState(false)
  const [dmScript, setDmScript] = useState('')
  const [generating, setGenerating] = useState(false)

  const filtered = fans.filter((f) => {
    const matchSearch = f.username.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' || f.tier === filter || f.platform === filter
    return matchSearch && matchFilter
  })

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    setSelected(selected.length === filtered.length ? [] : filtered.map((f) => f.id))
  }

  async function generateDM() {
    setGenerating(true)
    try {
      const segment = fans.filter((f) => selected.includes(f.id))
      const result = await aiService.generateDMScript(segment, 'exclusive_drop').catch(() => null)

      setDmScript(
        result?.script ||
          `Hey! 👊 You’ve been supporting since day one.\n\nI’m dropping something exclusive soon.\nReply "IN" if you want early access.`
      )

      setDmModal(true)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* SEARCH */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: '#1A1A26' }}>
        <Search size={14} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fans..."
          className="bg-transparent outline-none text-sm flex-1"
        />
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'superfan', 'loyal', 'twitter', 'instagram'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded text-xs"
            style={{
              background: filter === f ? '#FF6B00' : '#1A1A26',
              color: '#fff',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1A1A26' }}>
        <table className="w-full">
          <thead>
            <tr>
              <th />
              <th>Fan</th>
              <th>Platform</th>
              <th>Score</th>
              <th>Tier</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((fan) => (
              <tr key={fan.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(fan.id)}
                    onChange={() => toggleSelect(fan.id)}
                  />
                </td>

                <td>@{fan.username}</td>

                <td>
                  {fan.platform === 'twitter' ? (
                    <FaTwitter size={14} color="#1DA1F2" />
                  ) : (
                    <FaInstagram size={14} color="#E1306C" />

                  )}
                </td>

                <td>{fan.score}</td>

                <td>{fan.tier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION */}
      {selected.length > 0 && (
        <Button icon={Send} onClick={generateDM} loading={generating}>
          Generate DM Script
        </Button>
      )}

      {/* MODAL */}
      <Modal open={dmModal} onClose={() => setDmModal(false)} title="DM Script">
        <textarea
          value={dmScript}
          onChange={(e) => setDmScript(e.target.value)}
          rows={8}
          className="w-full"
        />
      </Modal>
    </div>
  )
}














// import { useEffect, useState } from 'react'
// import { Search, Filter, Download, Send, Star } from 'lucide-react'
// import { Button, Badge, Modal, Input } from '../components/ui/Button'
// import { fanService } from '../services/fanService'
// import { FaTwitter } from "react-icons/fa";
// import { FaInstagram } from "react-icons/fa";


// import { aiService } from '../services/aiService'
// import toast from 'react-hot-toast'
 
// const mockFans = Array.from({ length: 25 }, (_, i) => ({
//   id: i + 1,
//   username: ['melodyhunter', 'basslineQueen', 'nocturnal_wav', 'soulpatch99', 'loopmaster_k',
//     'deepcuts_ty', 'rhythmsage', 'wavlength23', 'drumline_d', 'samplequeen'][i % 10] + (i > 9 ? i : ''),
//   platform: i % 2 === 0 ? 'twitter' : 'instagram',
//   score: Math.max(40, 97 - i * 2 + Math.random() * 3 | 0),
//   followers: Math.floor(Math.random() * 5000) + 200,
//   likes: Math.floor(Math.random() * 300) + 20,
//   comments: Math.floor(Math.random() * 80) + 5,
//   lastActive: `${Math.floor(Math.random() * 6) + 1}d ago`,
//   tier: i < 5 ? 'superfan' : i < 12 ? 'loyal' : 'engaged',
// }))
 
// const tierColor = { superfan: 'orange', loyal: 'purple', engaged: 'muted' }
 
// export default function Superfans() {
//   const [fans, setFans] = useState(mockFans)
//   const [search, setSearch] = useState('')
//   const [selected, setSelected] = useState([])
//   const [filter, setFilter] = useState('all')
//   const [dmModal, setDmModal] = useState(false)
//   const [dmScript, setDmScript] = useState('')
//   const [generating, setGenerating] = useState(false)
//   const [importHandle, setImportHandle] = useState('')
//   const [importing, setImporting] = useState(false)
 
//   const filtered = fans.filter((f) => {
//     const matchSearch = f.username.toLowerCase().includes(search.toLowerCase())
//     const matchFilter = filter === 'all' || f.tier === filter || f.platform === filter
//     return matchSearch && matchFilter
//   })
 
//   function toggleSelect(id) {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     )
//   }
 
//   function toggleAll() {
//     setSelected(selected.length === filtered.length ? [] : filtered.map((f) => f.id))
//   }
 
//   async function generateDM() {
//     setGenerating(true)
//     try {
//       const segment = fans.filter((f) => selected.includes(f.id))
//       const result = await aiService.generateDMScript(segment, 'exclusive_drop').catch(() => null)
//       setDmScript(
//         result?.script ||
//           `Hey [name]! 👊 You've been one of my day-ones since the beginning and I see you.\n\nI'm dropping something exclusive that I'm ONLY sharing with my top supporters — a full behind-the-scenes studio session + unreleased tracks.\n\nFirst 50 people get early access for just $10. Reply "IN" if you want it.\n\nThis is me chasing the dream independently, and you make that possible. 🙏\n\n— JP`
//       )
//       setDmModal(true)
//     } finally {
//       setGenerating(false)
//     }
//   }
 
//   async function importFromTwitter() {
//     if (!importHandle) return
//     setImporting(true)
//     try {
//       await fanService.importFromTwitter(importHandle).catch(() => {})
//       toast.success(`Imported fans from @${importHandle}`)
//     } finally {
//       setImporting(false)
//       setImportHandle('')
//     }
//   }
 
//   return (
//     <div className="space-y-5 animate-fade-in">
//       {/* Header actions */}
//       <div className="flex items-center gap-3 flex-wrap">
//         {/* Search */}
//         <div
//           className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-48"
//           style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
//         >
//           <Search size={14} style={{ color: '#6B6B8A' }} />
//           <input
//             placeholder="Search fans..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="bg-transparent outline-none text-sm flex-1"
//             style={{ color: '#F0F0FF', fontFamily: 'DM Sans, sans-serif' }}
//           />
//         </div>
 
//         {/* Filters */}
//         {['all', 'superfan', 'loyal', 'twitter', 'instagram'].map((f) => (
//           <button
//             key={f}
//             onClick={() => setFilter(f)}
//             className="px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
//             style={{
//               background: filter === f ? '#FF6B00' : '#1A1A26',
//               color: filter === f ? '#fff' : '#6B6B8A',
//               border: `1px solid ${filter === f ? '#FF6B00' : '#2A2A3A'}`,
//               fontFamily: 'Syne, sans-serif',
//             }}
//           >
//             {f}
//           </button>
//         ))}
 
//         {/* Import */}
//         <div
//           className="flex items-center gap-2 px-3 py-2 rounded-lg"
//           style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
//         >
//             <FaTwitter size={14} color="#1DA1F2" />
//             <FaInstagram size={13} color="#E1306C" />


//           {/* <Twitter size={14} style={{ color: '#1DA1F2' }} />
//           <input
//             placeholder="@handle"
//             value={importHandle}
//             onChange={(e) => setImportHandle(e.target.value)}
//             className="bg-transparent outline-none text-sm w-24"
//             style={{ color: '#F0F0FF' }}
//           />
//           <button
//             onClick={importFromTwitter}
//             disabled={importing}
//             className="text-xs font-semibold transition-colors"
//             style={{ color: '#FF6B00' }}
//           >
//             {importing ? '...' : 'Import'}
//           </button> */}
//         </div>
//       </div>
 
//       {/* Bulk actions */}
//       {selected.length > 0 && (
//         <div
//           className="flex items-center gap-3 px-4 py-3 rounded-xl animate-slide-up"
//           style={{
//             background: 'rgba(255,107,0,0.1)',
//             border: '1px solid rgba(255,107,0,0.2)',
//           }}
//         >
//           <span className="text-sm font-semibold" style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}>
//             {selected.length} fans selected
//           </span>
//           <Button size="sm" icon={Send} onClick={generateDM} loading={generating}>
//             Generate DM Script
//           </Button>
//           <Button size="sm" variant="secondary" icon={Download}>
//             Export
//           </Button>
//           <button
//             className="ml-auto text-xs"
//             style={{ color: '#6B6B8A' }}
//             onClick={() => setSelected([])}
//           >
//             Clear
//           </button>
//         </div>
//       )}
 
//       {/* Fan table */}
//       <div
//         className="rounded-2xl overflow-hidden"
//         style={{ background: '#1A1A26', border: '1px solid #2A2A3A' }}
//       >
//         <table className="w-full fan-table">
//           <thead>
//             <tr>
//               <th>
//                 <input
//                   type="checkbox"
//                   onChange={toggleAll}
//                   checked={selected.length === filtered.length && filtered.length > 0}
//                   className="cursor-pointer"
//                   style={{ accentColor: '#FF6B00' }}
//                 />
//               </th>
//               <th>Fan</th>
//               <th>Platform</th>
//               <th>Score</th>
//               <th>Tier</th>
//               <th>Engagement</th>
//               <th>Last Active</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map((fan) => (
//               <tr key={fan.id}>
//                 <td>
//                   <input
//                     type="checkbox"
//                     checked={selected.includes(fan.id)}
//                     onChange={() => toggleSelect(fan.id)}
//                     style={{ accentColor: '#FF6B00', cursor: 'pointer' }}
//                   />
//                 </td>
//                 <td>
//                   <div className="flex items-center gap-2">
//                     <div
//                       className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
//                       style={{ background: 'linear-gradient(135deg, #FF6B00, #7B2FBE)', color: '#fff' }}
//                     >
//                       {fan.username[0].toUpperCase()}
//                     </div>
//                     <span style={{ color: '#F0F0FF' }}>@{fan.username}</span>
//                   </div>
//                 </td>
//                 <td>
//                   <div className="flex items-center gap-1">
//                     {fan.platform === 'twitter' ? (
//                       <Twitter size={13} style={{ color: '#1DA1F2' }} />
//                     ) : (
//                      <FaInstagram size={13} color="#E1306C" />
//                     )}
//                     <span style={{ color: '#6B6B8A' }}>{fan.platform}</span>
//                   </div>
//                 </td>
//                 <td>
//                   <div className="flex items-center gap-2">
//                     <div className="progress-bar w-16">
//                       <div
//                         className="progress-fill"
//                         style={{ width: `${fan.score}%` }}
//                       />
//                     </div>
//                     <span
//                       className="text-xs font-bold"
//                       style={{ color: '#FF6B00', fontFamily: 'Syne, sans-serif' }}
//                     >
//                       {fan.score}
//                     </span>
//                   </div>
//                 </td>
//                 <td>
//                   <Badge variant={tierColor[fan.tier]}>{fan.tier}</Badge>
//                 </td>
//                 <td style={{ color: '#6B6B8A' }}>
//                   {fan.likes}L / {fan.comments}C
//                 </td>
//                 <td style={{ color: '#6B6B8A' }}>{fan.lastActive}</td>
//                 <td>
//                   <button
//                     className="text-xs transition-colors"
//                     style={{ color: '#6B6B8A' }}
//                     onMouseEnter={(e) => (e.currentTarget.style.color = '#FF6B00')}
//                     onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B8A')}
//                   >
//                     <Star size={14} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
 
//       {/* DM Script Modal */}
//       <Modal open={dmModal} onClose={() => setDmModal(false)} title="AI DM Script" size="md">
//         <div className="space-y-4">
//           <div
//             className="text-xs font-semibold uppercase tracking-wider"
//             style={{ color: '#6B6B8A', fontFamily: 'Syne, sans-serif' }}
//           >
//             Send to {selected.length} fans · Estimated conversion: 8–15%
//           </div>
//           <textarea
//             value={dmScript}
//             onChange={(e) => setDmScript(e.target.value)}
//             rows={8}
//             className="w-full rounded-xl text-sm outline-none resize-none"
//             style={{
//               background: '#12121A',
//               border: '1px solid #2A2A3A',
//               color: '#F0F0FF',
//               padding: '12px',
//               fontFamily: 'DM Sans, sans-serif',
//               lineHeight: 1.6,
//             }}
//           />
//           <div className="flex gap-2">
//             <Button variant="primary" icon={Send} className="flex-1">
//               Send via Twitter DM
//             </Button>
//             <Button variant="secondary" icon={Instagram}>
//               Instagram DM
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   )
// }
 