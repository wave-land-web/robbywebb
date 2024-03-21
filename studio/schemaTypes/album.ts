import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'album',
  title: 'Album',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The title of the album or single.',
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'reference',
      to: {type: 'artist'},
      description: 'Example: The Beatles, The Rolling Stones, etc.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        "The URL path to this album or single. It's recommended to auto generate this field by clicking the 'Generate' button.",
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'releaseDate',
      title: 'Release Date',
      type: 'date',
      description: 'The release date of the album or single.',
    }),
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'string',
      placeholder: 'Produced, Engineered, Mixed by Robby Webb',
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      initialValue: 'Independent',
      placeholder: 'Independent',
    }),
    defineField({
      name: 'musicLinks',
      title: 'Music Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              description: 'The type of streaming service.',
              placeholder: 'Apple Music',
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              description: 'Link to the album or single.',
              placeholder:
                'https://music.apple.com/be/album/i-found-grace-robby-webb-remix-single/1725203846',
            }),
          ],
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'artist.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },
})
