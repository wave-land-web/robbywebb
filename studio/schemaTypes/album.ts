import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The title of the album or single.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'reference',
      to: {type: 'artist'},
      description: 'Example: The Beatles, The Rolling Stones, etc.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      description: 'The type of project (remix, single, etc.).',
      options: {
        layout: 'radio',
        list: ['Single', 'LP', 'EP', 'Remix', 'Cover'],
      },
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'releaseYear',
      title: 'Release Year',
      type: 'number',
      placeholder: '2024',
      description: 'The release year of the album or single.',
      validation: (Rule) => Rule.required().min(1900).max(2099),
    }),
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'string',
      placeholder: 'Producer, Engineer, Mixer',
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description:
        'The date and time when this was published or released. This is used to sort projects on your website. The newest projects will be displayed first.',
      options: {
        dateFormat: 'MM-DD-YYYY',
        timeFormat: 'HH:mm',
      },
      validation: (Rule) => Rule.required().error('Please add a date'),
      initialValue: () => new Date().toISOString(), // Example: 2024-03-21T19:16:53.654Z
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
