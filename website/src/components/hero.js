const crossStyle = {
  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'><line x1='0' y1='0' x2='100' y2='100' stroke='black' vector-effect='non-scaling-stroke'/><line x1='0' y1='100' x2='100' y2='0' stroke='black' vector-effect='non-scaling-stroke'/></svg>\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: '100% 100%'
}

export default function Hero () {
  return (
    <div className='bg-nsgreen'>
      <div className='center mw9 ba b--black relative'>
        <GreenBox className='dn db-ns bg-nsgreen bl br b--black mh5' style={crossStyle}>
          <GreenBox>
            <GreenBox>
              <GreenBox>
                <GreenBox>
                  <GreenBox>
                    <GreenBox>
                      <div className='bg-black' style={{ height: 'min(22vw, 354px)' }} />
                    </GreenBox>
                  </GreenBox>
                </GreenBox>
              </GreenBox>
            </GreenBox>
          </GreenBox>
        </GreenBox>
        <div className='relative absolute-ns top-0 w-100 ph3 tc' style={{ height: '100%' }}>
          <img src='images/logo-nft.storage.png' style={{ width: '75vw', maxWidth: '1002px' }} className='mt4 mb2 mb4-ns' />
          <hgroup className='chicagoflf nsgray'>
            <h1 className='f4 f2-m f1-ns fw4 mv3'>Free Storage for NFTs</h1>
            <h2 className='f5 fw4 mw7 center mv3 lh-copy'>Unlimited<sup>*</sup> storage of NFT data on IPFS, backed by Filecoin and provided free to <a href='https://nfthack.ethglobal.co/' className='white no-underline underline-hover'>NFTHack</a> participants during the hackathon.</h2>
          </hgroup>
        </div>
      </div>
    </div>
  )
}

const greenBoxStyle = {
  paddingTop: 'min(3.6vw, 32px)',
  paddingBottom: 'min(3.6vw, 32px)',
  paddingRight: 'min(3.88vw, 54px)',
  paddingLeft: 'min(3.88vw, 54px)'
}

function GreenBox ({ className, style, children }) {
  style = style ? { ...greenBoxStyle, ...style } : greenBoxStyle
  className = className ?? 'ba b--black'
  return <div className={className} style={style}>{children}</div>
}