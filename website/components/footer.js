import Link from 'next/link'

export default function Footer () {
  return (
    <footer className='bg-black db db-m flex-ns items-center justify-between f7 white pv3 ph5'>
      <div>
        <span className='db db-m dib-ns mv3'>Made with ❤️ by Protocol Labs</span>
        <Dot />
        <span className='db db-m dib-ns mv3'>
          <span>Made for</span> <a href='https://nfthack.ethglobal.co/' className='nspink no-underline v-mid'>NFTHack</a>
        </span>
        <Dot />
        <span className='db db-m dib-ns mv3'>
          <span>Powered by <a href='https://pinata.cloud/' className='nspink no-underline v-mid'>Pinata</a></span>
          <img src='/images/logo-pinata.svg' width={20} alt='Pinata logo' className='v-mid' />
        </span>
      </div>
      <div>
        <span className='db db-m dib-ns mv3'>
          <Link href='/terms'><a className='nspink no-underline underline-hover v-mid'>Terms &amp; Conditions</a></Link>
        </span>
        <Dot />
        <span className='db db-m dib-ns mv3'>
          Need Help? <a href='https://github.com/ipfs-shipyard/nft.storage/issues/new' className='nspink  underline-hover no-underline'>Open an Issue</a>
        </span>
      </div>
    </footer>
  )
}

function Dot () {
  return <span className='mh2 b dn dn-m dib-ns mv3'>•</span>
}