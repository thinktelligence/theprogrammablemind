const _ = require('lodash')
const { flattenInPlace } = require('./flatten_in_place')

const the_gender_and_birth_date_of_bob_and_alice = {
  "checks": [
    "determiner"
  ],
  "concept": true,
  "context_id": 2,
  "context_index": 1,
  "default": true,
  "determiner": {
    "level": 0,
    "marker": "the",
    "modifiers": [],
    "range": {
      "end": 2,
      "start": 0
    },
    "text": "the",
    "word": "the"
  },
  "flatten_ignore": [
    "theable"
  ],
  "flattenInPlace": [
    [ "value", "theable", "property", "objects[0]" ],
    [ "object", "objects[1]" ],
  ],
  "focusableForPhrase": true,
  "interpolate": [
    {
      "property": "property"
    },
    {
      "word": "of"
    },
    {
      "property": "object"
    }
  ],
  "isList": true,
  "level": 1,
  "listable": true,
  "marker": "list",
  "namespaced": {
    "conjunction": {}
  },
  "object": {
    "default": true,
    "isList": true,
    "level": 1,
    "listable": true,
    "marker": "list",
    "range": {
      "end": 41,
      "start": 29
    },
    "text": "bob and alice",
    "types": [
      "list",
      "object",
      "unknown"
    ],
    "value": [
      {
        "dead": true,
        "level": 0,
        "marker": "unknown",
        "range": {
          "end": 31,
          "start": 29
        },
        "text": "bob",
        "types": [
          "unknown"
        ],
        "unknown": true,
        "value": "bob",
        "word": "bob"
      },
      {
        "dead": true,
        "level": 0,
        "marker": "unknown",
        "range": {
          "end": 41,
          "start": 37
        },
        "text": "alice",
        "types": [
          "unknown"
        ],
        "unknown": true,
        "value": "alice",
        "word": "alice"
      }
    ],
    "word": "and"
  },
  "objects": [
    {
      "checks": [
        "determiner"
      ],
      "concept": true,
      "default": true,
      "determiner": {
        "level": 0,
        "marker": "the",
        "modifiers": [],
        "range": {
          "end": 2,
          "start": 0
        },
        "text": "the",
        "word": "the"
      },
      "flatten_ignore": [
        "theable"
      ],
      "flattenInPlace": [ [ "value", "theable" ] ],
      "focusableForPhrase": true,
      "interpolate": [
        {
          "property": "determiner"
        },
        {
          "property": "theable"
        }
      ],
      "isList": true,
      "level": 1,
      "listable": true,
      "marker": "list",
      "pullFromContext": true,
      "range": {
        "end": 24,
        "start": 0
      },
      "text": "the gender and birth date",
      "theable": {
        "default": true,
        "isList": true,
        "level": 1,
        "listable": true,
        "marker": "list",
        "range": {
          "end": 24,
          "start": 4
        },
        "text": "gender and birth date",
        "types": [
          "birth_dates_date_dates",
          "gender",
          "list"
        ],
        "value": [
          {
            "dead": true,
            "level": 0,
            "marker": "gender",
            "number": "one",
            "range": {
              "end": 9,
              "start": 4
            },
            "text": "gender",
            "value": "gender",
            "word": "gender"
          },
          {
            "atomic": true,
            "compatible_types": [
              "date_dates"
            ],
            "dead": true,
            "level": 0,
            "marker": "birth_dates_date_dates",
            "modifier_birth_dates": {
              "level": 0,
              "marker": "birth_dates",
              "number": "one",
              "range": {
                "end": 19,
                "start": 15
              },
              "text": "birth",
              "types": [
                "birth_dates"
              ],
              "value": "birth_dates",
              "word": "birth"
            },
            "modifiers": [
              "modifier_birth_dates"
            ],
            "range": {
              "end": 24,
              "start": 15
            },
            "text": "birth date",
            "types": [
              "birth_dates_date_dates",
              "date_dates"
            ],
            "value": "birth_dates_date_dates",
            "word": "date"
          }
        ],
        "word": "and"
      },
      "types": [
        "birth_dates_date_dates",
        "gender",
        "list"
      ],
      "value": [
        {
          "dead": true,
          "level": 0,
          "marker": "gender",
          "number": "one",
          "range": {
            "end": 9,
            "start": 4
          },
          "text": "gender",
          "value": "gender",
          "word": "gender"
        },
        {
          "atomic": true,
          "compatible_types": [
            "date_dates"
          ],
          "dead": true,
          "level": 0,
          "marker": "birth_dates_date_dates",
          "modifier_birth_dates": {
            "level": 0,
            "marker": "birth_dates",
            "number": "one",
            "range": {
              "end": 19,
              "start": 15
            },
            "text": "birth",
            "types": [
              "birth_dates"
            ],
            "value": "birth_dates",
            "word": "birth"
          },
          "modifiers": [
            "modifier_birth_dates"
          ],
          "range": {
            "end": 24,
            "start": 15
          },
          "text": "birth date",
          "types": [
            "birth_dates_date_dates",
            "date_dates"
          ],
          "value": "birth_dates_date_dates",
          "word": "date"
        }
      ],
      "wantsValue": true,
      "word": "and"
    },
    {
      "default": true,
      "isList": true,
      "level": 1,
      "listable": true,
      "marker": "list",
      "range": {
        "end": 41,
        "start": 29
      },
      "text": "bob and alice",
      "types": [
        "list",
        "object",
        "unknown"
      ],
      "value": [
        {
          "dead": true,
          "level": 0,
          "marker": "unknown",
          "range": {
            "end": 31,
            "start": 29
          },
          "text": "bob",
          "types": [
            "unknown"
          ],
          "unknown": true,
          "value": "bob",
          "word": "bob"
        },
        {
          "dead": true,
          "level": 0,
          "marker": "unknown",
          "range": {
            "end": 41,
            "start": 37
          },
          "text": "alice",
          "types": [
            "unknown"
          ],
          "unknown": true,
          "value": "alice",
          "word": "alice"
        }
      ],
      "word": "and"
    }
  ],
  "property": {
    "checks": [
      "determiner"
    ],
    "concept": true,
    "default": true,
    "determiner": {
      "level": 0,
      "marker": "the",
      "modifiers": [],
      "range": {
        "end": 2,
        "start": 0
      },
      "text": "the",
      "word": "the"
    },
    "flatten_ignore": [
      "theable"
    ],
    "flattenInPlace": [ [ "value", "theable" ] ],
    "focusableForPhrase": true,
    "interpolate": [
      {
        "property": "determiner"
      },
      {
        "property": "theable"
      }
    ],
    "isList": true,
    "level": 1,
    "listable": true,
    "marker": "list",
    "pullFromContext": true,
    "range": {
      "end": 24,
      "start": 0
    },
    "text": "the gender and birth date",
    "theable": {
      "default": true,
      "isList": true,
      "level": 1,
      "listable": true,
      "marker": "list",
      "range": {
        "end": 24,
        "start": 4
      },
      "text": "gender and birth date",
      "types": [
        "birth_dates_date_dates",
        "gender",
        "list"
      ],
      "value": [
        {
          "dead": true,
          "level": 0,
          "marker": "gender",
          "number": "one",
          "range": {
            "end": 9,
            "start": 4
          },
          "text": "gender",
          "value": "gender",
          "word": "gender"
        },
        {
          "atomic": true,
          "compatible_types": [
            "date_dates"
          ],
          "dead": true,
          "level": 0,
          "marker": "birth_dates_date_dates",
          "modifier_birth_dates": {
            "level": 0,
            "marker": "birth_dates",
            "number": "one",
            "range": {
              "end": 19,
              "start": 15
            },
            "text": "birth",
            "types": [
              "birth_dates"
            ],
            "value": "birth_dates",
            "word": "birth"
          },
          "modifiers": [
            "modifier_birth_dates"
          ],
          "range": {
            "end": 24,
            "start": 15
          },
          "text": "birth date",
          "types": [
            "birth_dates_date_dates",
            "date_dates"
          ],
          "value": "birth_dates_date_dates",
          "word": "date"
        }
      ],
      "word": "and"
    },
    "types": [
      "birth_dates_date_dates",
      "gender",
      "list"
    ],
    "value": [
      {
        "dead": true,
        "level": 0,
        "marker": "gender",
        "number": "one",
        "range": {
          "end": 9,
          "start": 4
        },
        "text": "gender",
        "value": "gender",
        "word": "gender"
      },
      {
        "atomic": true,
        "compatible_types": [
          "date_dates"
        ],
        "dead": true,
        "level": 0,
        "marker": "birth_dates_date_dates",
        "modifier_birth_dates": {
          "level": 0,
          "marker": "birth_dates",
          "number": "one",
          "range": {
            "end": 19,
            "start": 15
          },
          "text": "birth",
          "types": [
            "birth_dates"
          ],
          "value": "birth_dates",
          "word": "birth"
        },
        "modifiers": [
          "modifier_birth_dates"
        ],
        "range": {
          "end": 24,
          "start": 15
        },
        "text": "birth date",
        "types": [
          "birth_dates_date_dates",
          "date_dates"
        ],
        "value": "birth_dates_date_dates",
        "word": "date"
      }
    ],
    "wantsValue": true,
    "word": "and"
  },
  "propertyOf": true,
  "pullFromContext": true,
  "range": {
    "end": 41,
    "start": 0
  },
  "text": "the gender and birth date of bob and alice",
  "theable": {
    "default": true,
    "isList": true,
    "level": 1,
    "listable": true,
    "marker": "list",
    "range": {
      "end": 24,
      "start": 4
    },
    "text": "gender and birth date",
    "types": [
      "birth_dates_date_dates",
      "gender",
      "list"
    ],
    "value": [
      {
        "dead": true,
        "level": 0,
        "marker": "gender",
        "number": "one",
        "range": {
          "end": 9,
          "start": 4
        },
        "text": "gender",
        "value": "gender",
        "word": "gender"
      },
      {
        "atomic": true,
        "compatible_types": [
          "date_dates"
        ],
        "dead": true,
        "level": 0,
        "marker": "birth_dates_date_dates",
        "modifier_birth_dates": {
          "level": 0,
          "marker": "birth_dates",
          "number": "one",
          "range": {
            "end": 19,
            "start": 15
          },
          "text": "birth",
          "types": [
            "birth_dates"
          ],
          "value": "birth_dates",
          "word": "birth"
        },
        "modifiers": [
          "modifier_birth_dates"
        ],
        "range": {
          "end": 24,
          "start": 15
        },
        "text": "birth date",
        "types": [
          "birth_dates_date_dates",
          "date_dates"
        ],
        "value": "birth_dates_date_dates",
        "word": "date"
      }
    ],
    "word": "and"
  },
  "topLevel": true,
  "touchedBy": [
    "askfor#call2"
  ],
  "types": [
    "birth_dates_date_dates",
    "gender",
    "list"
  ],
  "value": [
    {
      "dead": true,
      "level": 0,
      "marker": "gender",
      "number": "one",
      "range": {
        "end": 9,
        "start": 4
      },
      "text": "gender",
      "value": "gender",
      "word": "gender"
    },
    {
      "atomic": true,
      "compatible_types": [
        "date_dates"
      ],
      "dead": true,
      "level": 0,
      "marker": "birth_dates_date_dates",
      "modifier_birth_dates": {
        "level": 0,
        "marker": "birth_dates",
        "number": "one",
        "range": {
          "end": 19,
          "start": 15
        },
        "text": "birth",
        "types": [
          "birth_dates"
        ],
        "value": "birth_dates",
        "word": "birth"
      },
      "modifiers": [
        "modifier_birth_dates"
      ],
      "range": {
        "end": 24,
        "start": 15
      },
      "text": "birth date",
      "types": [
        "birth_dates_date_dates",
        "date_dates"
      ],
      "value": "birth_dates_date_dates",
      "word": "date"
    }
  ],
  "wantsValue": true,
  "word": "and"
}

const the_gender_and_birth_date_of_bob = {
  "marker": "list",
  "default": true,
  "word": "and",
  "text": "the gender and birth date of bob",
  "range": {
    "start": 8,
    "end": 39
  },
  "types": [
    "birth_dates_date_dates",
    "gender",
    "list"
  ],
  "listable": true,
  "isList": true,
  "flattenInPlace": [ [ "value", "theable", "property", "objects[0]", ] ],
  "value": [
    {
      "value": "gender",
      "number": "one",
      "text": "gender",
      "marker": "gender",
      "word": "gender",
      "range": {
        "start": 12,
        "end": 17
      },
      "dead": true,
      "level": 0
    },
    {
      "value": "birth_dates_date_dates",
      "text": "birth date",
      "marker": "birth_dates_date_dates",
      "word": "date",
      "range": {
        "start": 23,
        "end": 32
      },
      "types": [
        "birth_dates_date_dates",
        "date_dates"
      ],
      "modifier_birth_dates": {
        "value": "birth_dates",
        "number": "one",
        "text": "birth",
        "marker": "birth_dates",
        "word": "birth",
        "range": {
          "start": 23,
          "end": 27
        },
        "types": [
          "birth_dates"
        ],
        "level": 0
      },
      "atomic": true,
      "dead": true,
      "compatible_types": [
        "date_dates"
      ],
      "modifiers": [
        "modifier_birth_dates"
      ],
      "level": 0
    }
  ],
  "focusableForPhrase": true,
  "pullFromContext": true,
  "concept": true,
  "wantsValue": true,
  "checks": [
    "determiner"
  ],
  "determiner": {
    "modifiers": [],
    "text": "the",
    "marker": "the",
    "word": "the",
    "range": {
      "start": 8,
      "end": 10
    },
    "level": 0
  },
  "theable": {
    "marker": "list",
    "default": true,
    "word": "and",
    "text": "gender and birth date",
    "range": {
      "start": 12,
      "end": 32
    },
    "types": [
      "birth_dates_date_dates",
      "gender",
      "list"
    ],
    "listable": true,
    "isList": true,
    "value": [
      {
        "value": "gender",
        "number": "one",
        "text": "gender",
        "marker": "gender",
        "word": "gender",
        "range": {
          "start": 12,
          "end": 17
        },
        "dead": true,
        "level": 0
      },
      {
        "value": "birth_dates_date_dates",
        "text": "birth date",
        "marker": "birth_dates_date_dates",
        "word": "date",
        "range": {
          "start": 23,
          "end": 32
        },
        "types": [
          "birth_dates_date_dates",
          "date_dates"
        ],
        "modifier_birth_dates": {
          "value": "birth_dates",
          "number": "one",
          "text": "birth",
          "marker": "birth_dates",
          "word": "birth",
          "range": {
            "start": 23,
            "end": 27
          },
          "types": [
            "birth_dates"
          ],
          "level": 0
        },
        "atomic": true,
        "dead": true,
        "compatible_types": [
          "date_dates"
        ],
        "modifiers": [
          "modifier_birth_dates"
        ],
        "level": 0
      }
    ],
    "level": 1
  },
  "flatten_ignore": [
    "theable"
  ],
  "interpolate": [
    {
      "property": "property"
    },
    {
      "word": "of"
    },
    {
      "property": "object"
    }
  ],
  "propertyOf": true,
  "property": {
    "marker": "list",
    "default": true,
    "word": "and",
    "text": "the gender and birth date",
    "range": {
      "start": 8,
      "end": 32
    },
    "types": [
      "birth_dates_date_dates",
      "gender",
      "list"
    ],
    "listable": true,
    "isList": true,
    "value": [
      {
        "value": "gender",
        "number": "one",
        "text": "gender",
        "marker": "gender",
        "word": "gender",
        "range": {
          "start": 12,
          "end": 17
        },
        "dead": true,
        "level": 0
      },
      {
        "value": "birth_dates_date_dates",
        "text": "birth date",
        "marker": "birth_dates_date_dates",
        "word": "date",
        "range": {
          "start": 23,
          "end": 32
        },
        "types": [
          "birth_dates_date_dates",
          "date_dates"
        ],
        "modifier_birth_dates": {
          "value": "birth_dates",
          "number": "one",
          "text": "birth",
          "marker": "birth_dates",
          "word": "birth",
          "range": {
            "start": 23,
            "end": 27
          },
          "types": [
            "birth_dates"
          ],
          "level": 0
        },
        "atomic": true,
        "dead": true,
        "compatible_types": [
          "date_dates"
        ],
        "modifiers": [
          "modifier_birth_dates"
        ],
        "level": 0
      }
    ],
    "focusableForPhrase": true,
    "pullFromContext": true,
    "concept": true,
    "wantsValue": true,
    "checks": [
      "determiner"
    ],
    "determiner": {
      "modifiers": [],
      "text": "the",
      "marker": "the",
      "word": "the",
      "range": {
        "start": 8,
        "end": 10
      },
      "level": 0
    },
    "theable": {
      "marker": "list",
      "default": true,
      "word": "and",
      "text": "gender and birth date",
      "range": {
        "start": 12,
        "end": 32
      },
      "types": [
        "birth_dates_date_dates",
        "gender",
        "list"
      ],
      "listable": true,
      "isList": true,
      "value": [
        {
          "value": "gender",
          "number": "one",
          "text": "gender",
          "marker": "gender",
          "word": "gender",
          "range": {
            "start": 12,
            "end": 17
          },
          "dead": true,
          "level": 0
        },
        {
          "value": "birth_dates_date_dates",
          "text": "birth date",
          "marker": "birth_dates_date_dates",
          "word": "date",
          "range": {
            "start": 23,
            "end": 32
          },
          "types": [
            "birth_dates_date_dates",
            "date_dates"
          ],
          "modifier_birth_dates": {
            "value": "birth_dates",
            "number": "one",
            "text": "birth",
            "marker": "birth_dates",
            "word": "birth",
            "range": {
              "start": 23,
              "end": 27
            },
            "types": [
              "birth_dates"
            ],
            "level": 0
          },
          "atomic": true,
          "dead": true,
          "compatible_types": [
            "date_dates"
          ],
          "modifiers": [
            "modifier_birth_dates"
          ],
          "level": 0
        }
      ],
      "level": 1
    },
    "flatten_ignore": [
      "theable"
    ],
    "interpolate": [
      {
        "property": "determiner"
      },
      {
        "property": "theable"
      }
    ],
    "level": 1
  },
  "object": {
    "value": "bob",
    "unknown": true,
    "text": "bob",
    "marker": "object",
    "word": "bob",
    "range": {
      "start": 37,
      "end": 39
    },
    "dead": true,
    "types": [
      "object"
    ],
    "level": 0
  },
  "objects": [
    {
      "marker": "list",
      "default": true,
      "word": "and",
      "text": "the gender and birth date",
      "range": {
        "start": 8,
        "end": 32
      },
      "types": [
        "birth_dates_date_dates",
        "gender",
        "list"
      ],
      "listable": true,
      "isList": true,
      "value": [
        {
          "value": "gender",
          "number": "one",
          "text": "gender",
          "marker": "gender",
          "word": "gender",
          "range": {
            "start": 12,
            "end": 17
          },
          "dead": true,
          "level": 0
        },
        {
          "value": "birth_dates_date_dates",
          "text": "birth date",
          "marker": "birth_dates_date_dates",
          "word": "date",
          "range": {
            "start": 23,
            "end": 32
          },
          "types": [
            "birth_dates_date_dates",
            "date_dates"
          ],
          "modifier_birth_dates": {
            "value": "birth_dates",
            "number": "one",
            "text": "birth",
            "marker": "birth_dates",
            "word": "birth",
            "range": {
              "start": 23,
              "end": 27
            },
            "types": [
              "birth_dates"
            ],
            "level": 0
          },
          "atomic": true,
          "dead": true,
          "compatible_types": [
            "date_dates"
          ],
          "modifiers": [
            "modifier_birth_dates"
          ],
          "level": 0
        }
      ],
      "focusableForPhrase": true,
      "pullFromContext": true,
      "concept": true,
      "wantsValue": true,
      "checks": [
        "determiner"
      ],
      "determiner": {
        "modifiers": [],
        "text": "the",
        "marker": "the",
        "word": "the",
        "range": {
          "start": 8,
          "end": 10
        },
        "level": 0
      },
      "theable": {
        "marker": "list",
        "default": true,
        "word": "and",
        "text": "gender and birth date",
        "range": {
          "start": 12,
          "end": 32
        },
        "types": [
          "birth_dates_date_dates",
          "gender",
          "list"
        ],
        "listable": true,
        "isList": true,
        "value": [
          {
            "value": "gender",
            "number": "one",
            "text": "gender",
            "marker": "gender",
            "word": "gender",
            "range": {
              "start": 12,
              "end": 17
            },
            "dead": true,
            "level": 0
          },
          {
            "value": "birth_dates_date_dates",
            "text": "birth date",
            "marker": "birth_dates_date_dates",
            "word": "date",
            "range": {
              "start": 23,
              "end": 32
            },
            "types": [
              "birth_dates_date_dates",
              "date_dates"
            ],
            "modifier_birth_dates": {
              "value": "birth_dates",
              "number": "one",
              "text": "birth",
              "marker": "birth_dates",
              "word": "birth",
              "range": {
                "start": 23,
                "end": 27
              },
              "types": [
                "birth_dates"
              ],
              "level": 0
            },
            "atomic": true,
            "dead": true,
            "compatible_types": [
              "date_dates"
            ],
            "modifiers": [
              "modifier_birth_dates"
            ],
            "level": 0
          }
        ],
        "level": 1
      },
      "flatten_ignore": [
        "theable"
      ],
      "interpolate": [
        {
          "property": "determiner"
        },
        {
          "property": "theable"
        }
      ],
      "level": 1
    },
    {
      "value": "bob",
      "unknown": true,
      "text": "bob",
      "marker": "object",
      "word": "bob",
      "range": {
        "start": 37,
        "end": 39
      },
      "dead": true,
      "types": [
        "object"
      ],
      "level": 0
    }
  ],
  "level": 1
}

const the_gender_and_birth_date = {
  "marker": "list",
  "default": true,
  "word": "and",
  "text": "the gender and birth date",
  "range": {
    "start": 8,
    "end": 32
  },
  "types": [
    "birth_dates_date_dates",
    "gender",
    "list"
  ],
  "listable": true,
  "isList": true,
  "flattenInPlace": [ [ "value", "theable", ] ],
  "value": [
    {
      "value": "gender",
      "number": "one",
      "text": "gender",
      "marker": "gender",
      "word": "gender",
      "range": {
        "start": 12,
        "end": 17
      },
      "dead": true,
      "level": 0
    },
    {
      "value": "birth_dates_date_dates",
      "text": "birth date",
      "marker": "birth_dates_date_dates",
      "word": "date",
      "range": {
        "start": 23,
        "end": 32
      },
      "types": [
        "birth_dates_date_dates",
        "date_dates"
      ],
      "modifier_birth_dates": {
        "value": "birth_dates",
        "number": "one",
        "text": "birth",
        "marker": "birth_dates",
        "word": "birth",
        "range": {
          "start": 23,
          "end": 27
        },
        "types": [
          "birth_dates"
        ],
        "level": 0
      },
      "atomic": true,
      "dead": true,
      "compatible_types": [
        "date_dates"
      ],
      "modifiers": [
        "modifier_birth_dates"
      ],
      "level": 0
    }
  ],
  "focusableForPhrase": true,
  "pullFromContext": true,
  "concept": true,
  "wantsValue": true,
  "checks": [
    "determiner"
  ],
  "determiner": {
    "modifiers": [],
    "text": "the",
    "marker": "the",
    "word": "the",
    "range": {
      "start": 8,
      "end": 10
    },
    "level": 0
  },
  "theable": {
    "marker": "list",
    "default": true,
    "word": "and",
    "text": "gender and birth date",
    "range": {
      "start": 12,
      "end": 32
    },
    "types": [
      "birth_dates_date_dates",
      "gender",
      "list"
    ],
    "listable": true,
    "isList": true,
    "value": [
      {
        "value": "gender",
        "number": "one",
        "text": "gender",
        "marker": "gender",
        "word": "gender",
        "range": {
          "start": 12,
          "end": 17
        },
        "dead": true,
        "level": 0
      },
      {
        "value": "birth_dates_date_dates",
        "text": "birth date",
        "marker": "birth_dates_date_dates",
        "word": "date",
        "range": {
          "start": 23,
          "end": 32
        },
        "types": [
          "birth_dates_date_dates",
          "date_dates"
        ],
        "modifier_birth_dates": {
          "value": "birth_dates",
          "number": "one",
          "text": "birth",
          "marker": "birth_dates",
          "word": "birth",
          "range": {
            "start": 23,
            "end": 27
          },
          "types": [
            "birth_dates"
          ],
          "level": 0
        },
        "atomic": true,
        "dead": true,
        "compatible_types": [
          "date_dates"
        ],
        "modifiers": [
          "modifier_birth_dates"
        ],
        "level": 0
      }
    ],
    "level": 1
  },
  "flatten_ignore": [
    "theable"
  ],
  "interpolate": [
    {
      "property": "determiner"
    },
    {
      "property": "theable"
    }
  ],
  "level": 1
}

describe('flattenInPlace', () => {
  it('NEOS23 noop', () => {
    const context = {}
    const actual = flattenInPlace(context)
    expect(actual).toStrictEqual([context])
  })

  it('NEOS23 the_gender_and_birth_date', () => {
    const context = the_gender_and_birth_date
    const gender = {...context}
    gender.value = context.value[0]
    Object.assign(gender, context.value[0])
    gender.value = context.value[0].value
    gender.theable = context.theable.value[0]
    gender.listable = undefined
    gender.isList = undefined
    gender.types = context.theable.value[0].types
    const birth_date = {...context}
    Object.assign(birth_date, context.value[1])
    birth_date.value = context.value[1].value
    birth_date.theable = context.theable.value[1]
    birth_date.listable = undefined
    birth_date.isList = undefined
    debugger
    birth_date.types = context.theable.value[1].types
    console.log(JSON.stringify(gender, null, 2))
    const actual = flattenInPlace(['list'], context)
    expect(actual).toStrictEqual([gender, birth_date])
  })

  it('NEOS23 the_gender_and_birth_date of bob', () => {
    const context = the_gender_and_birth_date_of_bob
    const setup = (index) => {
      const expected = {...context}
      expected.value = context.value[index]
      Object.assign(expected, context.value[index])
      expected.value = context.value[index].value
      expected.theable = context.theable.value[index]
      expected.property = context.property.value[index]
      expected.objects = [ ...context.objects ]
      expected.objects[0] = context.objects[0].value[index]
      expected.listable = undefined
      expected.isList = undefined
      expected.types = context.theable.value[index].types
      return expected
    }

    const gender = setup(0)
    const birth_date = setup(1)

    const actual = flattenInPlace(['list'], context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual([gender, birth_date])
  })

  it('NEO23 the_gender_and_birth_date of bob', () => {
    const context = the_gender_and_birth_date_of_bob_and_alice

    const setup = (index) => {
      const expected = {...context}
      expected.value = context.value[index]
      Object.assign(expected, context.value[index])
      expected.value = context.value[index].value
      expected.theable = context.theable.value[index]
      expected.property = context.property.value[index]
      expected.objects = [ ...context.objects ]
      expected.objects[0] = context.objects[0].value[index]
      expected.listable = undefined
      expected.isList = undefined
      expected.types = context.theable.value[index].types
      return expected
    }

    const gender = setup(0)
    const birth_date = setup(1)

    const actual = flattenInPlace(['list'], context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual([gender, birth_date])
  })
})
