import Header from "@/components/Header"
import TemplateHero from "@/components/TemplateHero"
import AccountSection from "@/components/AccountSection"
import ContactSection from "@/components/ContactSection"
import About from "@/components/About"
export default function Home() {
    return (
        <>
            <Header />


            <div className="relative  w-dvw h-dvh top-10">
                <TemplateHero />
            </div>
            <div className="bg-black" id="account">
                <AccountSection />
            </div>
            <div id="about">
                <About />
            </div>
            <div id="contact">
                <ContactSection />
            </div>


        </>
    )
}
