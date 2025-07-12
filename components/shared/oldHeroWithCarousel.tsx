'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';

import { heroContent } from '@/constants';
import { Button } from '@ui/button';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '@/css/heroSectionStyles.css';
import Link from 'next/link';

function HeroContent({
  hero,
  className,
}: {
  hero: (typeof heroContent)[0];
  className: string;
}) {
  return (
    <div
      className={`relative z-10 flex flex-col justify-center items-center h-full ${className}`}
    >
      <div className="space-y-8 text-center">
        <h1 className="text-white h1-bold tracking-tight whitespace-pre-line drop-shadow-lg bg-primary-500 p-6">
          {hero.title}
        </h1>
        <Button
          size="lg"
          className=" button bg-primary-500 cursor-pointer p-regular-16"
        >
          <Link href={'/events'}>{hero.cta}</Link>
        </Button>
      </div>
    </div>
  );
}

export function HeroSection() {
  const content = heroContent;

  return (
    <div>
      <Swiper
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          type: 'bullets',
          clickable: true,
          bulletClass: 'swiper-pagination-bullet custom-bullet',
          bulletActiveClass:
            'swiper-pagination-bullet-active custom-bullet-active',
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        modules={[Navigation, Pagination, Autoplay]}
        className="h-[60vh] w-full rounded-lg cursor-pointer"
      >
        {content.map((hero, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              <Image
                src={hero.backgroundImage}
                alt={hero.title}
                fill
                className="block h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 z-10" />
              <HeroContent
                hero={hero}
                className="absolute inset-0 p-8 md:p-16"
              />
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-button-next custom-swiper-button"></div>
        <div className="swiper-button-prev custom-swiper-button"></div>
      </Swiper>
    </div>
  );
}
