import Header from "@/components/Header"
import TemplateHero from "@/components/TemplateHero"
import AccountSection from "@/components/AccountSection"
import About from "@/components/About"
import AuthorSection from "@/components/AuthorSection"
import ContactSection from "@/components/ContactSection"

export default function Home() {
    return (
        <>
            <Header />

            <div className="relative w-screen h-screen">
                <TemplateHero />
            </div>

            <div id="account" className="bg-gradient-to-b from-black to-gray-950">
                <AccountSection />
            </div>

            <div id="about">
                <About />
            </div>

            <div id="author">
                <AuthorSection />
            </div>

            <div id="contact">
                <ContactSection />
            </div>
        </>
    )
}
