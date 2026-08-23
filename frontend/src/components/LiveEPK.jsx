import { FaInstagram, FaTwitter } from 'react-icons/fa'

/**
 * Live EPK (electronic press kit) — folded in from the v2 build. That version
 * pulled icons from @iconify/react, which isn't a dependency here, so these use
 * react-icons. It also assumed `artistData` was always present; this defaults.
 */
export default function LiveEPK({ artistData = {}, followers = '15.2k', reach = '5.8k' }) {
  return (
    <div className="mt-12 p-1 bg-gradient-to-br from-brand-purple via-brand-orange to-brand-purple rounded-[40px]">
      <div className="bg-[#050505] rounded-[38px] p-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Artist identity */}
          <div className="flex-1">
            <span className="text-brand-orange font-mono text-xs tracking-widest uppercase">
              Verified Artist Profile
            </span>
            <h1 className="text-5xl md:text-6xl font-black italic text-white mt-2 mb-4 tracking-tighter">
              {artistData.name || 'Unnamed Artist'}
            </h1>
            <p className="text-gray-400 max-w-md leading-relaxed">
              {artistData.bio ||
                'Add a bio in Settings to have it appear on your press kit.'}
            </p>
            {artistData.genre && (
              <p className="mt-4 text-xs uppercase tracking-widest text-brand-purple font-bold">
                {artistData.genre}
              </p>
            )}
          </div>

          {/* Live social proof */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
              <FaInstagram className="mx-auto mb-2 text-pink-500 w-6 h-6" />
              <div className="text-2xl font-bold text-white">{followers}</div>
              <div className="text-[10px] text-gray-500 uppercase">Followers</div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
              <FaTwitter className="mx-auto mb-2 text-blue-400 w-6 h-6" />
              <div className="text-2xl font-bold text-white">{reach}</div>
              <div className="text-[10px] text-gray-500 uppercase">Reach</div>
            </div>
          </div>
        </div>

        {/* Actions for label reps */}
        <div className="mt-10 flex flex-wrap gap-4">
          <button className="px-8 py-3 bg-white text-black font-black rounded-full hover:scale-105 transition-transform">
            DOWNLOAD FULL EPK
          </button>
          <button className="px-8 py-3 bg-brand-purple/20 border border-brand-purple/50 text-brand-purple font-bold rounded-full hover:bg-brand-purple/30 transition-colors">
            VIEW LATEST GIGS
          </button>
        </div>
      </div>
    </div>
  )
}
