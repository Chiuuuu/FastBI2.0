export default {
  data: [
    {
      name: 'Grandpa',
      value: 30,
      children: [
        {
          name: 'Uncle Leo',
          value: 15,
          children: [
            {
              name: 'Cousin Jack',
              value: 5
            },
            {
              name: 'Cousin Mary',
              value: 5,
              children: [
                {
                  name: 'Jackson',
                  value: 2
                }
              ]
            },
            {
              name: 'Cousin Ben',
              value: 5
            }
          ]
        },
        {
          name: 'Father',
          value: 30,
          children: [
            {
              name: 'Me',
              value: 5
            },
            {
              name: 'Brother Peter',
              value: 5
            }
          ]
        }
      ]
    },
    {
      name: 'Nancy',
      value: 10,
      children: [
        {
          name: 'Uncle Nike',
          value: 6,
          children: [
            {
              name: 'Cousin Betty',
              value: 4
            },
            {
              name: 'Cousin Jenny',
              value: 2
            }
          ]
        }
      ]
    }
  ]
}
