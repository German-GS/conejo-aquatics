import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { ValueProps } from "@/components/ValueProps";
import { WholesaleBanner } from "@/components/WholesaleBanner";
import { Footer } from "@/components/Footer";
import { publico, SITIO_CONFIG_DEFECTO } from "@/lib/api";

export default async function Home() {
  // Una sola llamada acá arriba — Hero, WholesaleBanner y Footer reciben
  // el resultado por props en vez de pedirlo cada uno por su cuenta.
  const config = await publico.sitioConfig().catch(() => SITIO_CONFIG_DEFECTO);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero config={config} />
        <Categories />
        <FeaturedProducts />
        <ValueProps />
        <WholesaleBanner config={config} />
      </main>
      <Footer config={config} />
    </>
  );
}
