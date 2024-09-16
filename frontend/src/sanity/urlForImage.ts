import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from 'sanity:client'

export const imageBuilder = imageUrlBuilder(sanityClient)

export function urlForImage(source: { _ref: string; _type: string }) {
  return imageBuilder.image(source)
}
