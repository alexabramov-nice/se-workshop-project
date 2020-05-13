import React from "react";
import Carousel from "react-bootstrap/Carousel";
import { CarouselItem } from "./carousel-item.styles";
import { FaRegBell, FaGifts } from "react-icons/fa";
import { GiWorld } from "react-icons/gi";
export const CarouselUI = () => {
  return (
    <Carousel style={{ marginBottom: "20px"}}>
      <Carousel.Item>
        <CarouselItem>
          <h1>Real Time Alerts </h1>
          <h3>
            <FaRegBell style={{ marginRight: "0px", marginBottom: "0px" }} />
          </h3>
          <p>You know what we offer, LIVE!.</p>
        </CarouselItem>
      </Carousel.Item>
      <Carousel.Item>
        <CarouselItem>
          <h1>Unique Discounts</h1>
          <h3>
            <FaGifts style={{ marginRight: "0px", marginBottom: "0px" }} />
          </h3>
          <p>We offer the best prices on the WWW</p>
        </CarouselItem>
      </Carousel.Item>
      <Carousel.Item>
        <CarouselItem>

          <h1>Plenty Of Vendors</h1>
          <h3>
            <GiWorld style={{ marginRight: "0px", marginBottom: "0px" }} />
          </h3>
          <p>Shop from the one's you love for the one's you care</p>
        </CarouselItem>
      </Carousel.Item>
    </Carousel>
  );
};
