import Hero from "../components/home/hero/Hero"
import Features from "../components/home/features/Features"
import CommunitySection from "../components/home/communitySection/CommunitySection"
import Footer from "../components/home/footer/Footer"
import ScalabilitySection from "../components/home/scalabilitySection/ScalabilitySection"


export const Home = () => {

    return (
        <>
        <Hero />
        <ScalabilitySection />
        <Features />
        <CommunitySection />
        <Footer />
        </>
    )
}