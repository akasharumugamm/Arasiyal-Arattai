import CivilServicesDirectory from "@/components/CivilServicesDirectory";
import Link from "next/link";

export default function CivilServicesPage() {
  return <main className="app-shell" style={{minHeight:"100vh",background:"#f8fafc",color:"#172554"}}>
    <header className="app-header aa-home-header" style={{height:62,minHeight:62,maxHeight:62,boxSizing:"border-box",display:"flex",alignItems:"center",padding:"0 22px"}}>
      <Link className="aa-brand" href="/" aria-label="Arasiyal Arattai home">
        <img src="/aa-logo.svg" alt="" width={34} height={34} style={{width:34,height:34,objectFit:"contain"}}/>
        <span>Arasiyal Arattai</span>
      </Link>
      <nav className="aa-primary-nav" aria-label="Main navigation">
        <Link className="aa-primary-nav-link" href="/">Home</Link>
        <Link className="aa-primary-nav-link" href="/?section=office-bearers">Office Bearers</Link>
        <Link className="aa-primary-nav-link is-active" href="/civil-services" aria-current="page">Civil Services</Link>
        <Link className="aa-primary-nav-link" href="/?section=result">Result</Link>
        <Link className="aa-primary-nav-link" href="/?section=constituency">Constituency</Link>
      </nav>
    </header>
    <CivilServicesDirectory/>
  </main>;
}
