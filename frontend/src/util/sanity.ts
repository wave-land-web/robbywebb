import { getImage } from 'astro:assets'
import { sanityClient } from 'sanity:client'
import { urlForImage } from '../sanity/urlForImage'

export interface Project {
  _createdAt: string
  _id: string
  _rev: string
  _type: string
  _updatedAt: string
  artist: Artist
  credits: string
  label: string
  mainImage: MainImage
  musicLinks: MusicLink[]
  publishedAt: string
  releaseYear: number
  slug: Slug
  title: string
  type: string
}

export interface Artist {
  _ref: string
  _type: string
}

export interface MainImage {
  _type: string
  asset: { _ref: string; _type: string }
}

export interface MusicLink {
  _key: string
  link: string
  text: string
}

export interface Slug {
  _type: string
  current: string
}

// Get initial project data
const projects: Project[] = await sanityClient.fetch(
  `*[_type == "project"] | order(publishedAt desc)`
)

// Sort and return relevant album data for each project
const sortedAlbums = projects.map(async (project) => {
  const { artist, mainImage, slug, title, musicLinks, credits, label, releaseYear, type } = project

  const artistData = await sanityClient.fetch(`*[_id == "${artist._ref}"]`)

  const image = await getImage({
    src: urlForImage(mainImage.asset).format('webp').url(),
    format: 'webp',
    inferSize: true,
  })

  return {
    image: image.src,
    artist: artistData[0],
    title,
    slug: slug.current,
    credits,
    label,
    year: releaseYear,
    type,
    musicLinks,
  }
})

export const albumData = await Promise.all(sortedAlbums)
