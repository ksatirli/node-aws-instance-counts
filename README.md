# `aws-instance-counts`

> Quickly get an overview of running AWS EC2 and RDS Instances

## This project is no longer maintained

`aws-instance-counts` is no longer actively maintained and is only made available here for reference. The project itself is still capable of listing AWS EC2 and RDS instances.

What follows is the original `README.md`:

---

## Table of Contents

- [Requirements](#requirements)
- [Dependencies](#dependencies)
- [Usage](#usage)
- [Author Information](#author-information)
- [License](#license)

## Requirements

This module requires Node.js version `4.x.x` or newer.

## Dependencies

This scripts requires you to have access to valid AWS IAM keys

## Usage

Add the module to your Terraform resources like so:

```sh
export AWS_ACCESS_KEY="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
export AWS_REGION="us-east-1"
export DEBUG=true
export TARGET=ec2

node index
```

## Author Information

This module is maintained by the contributors listed on [GitHub](https://github.com/operatehappy/node-link-git-hooks/graphs/contributors)

Development of this module was sponsored by [Operate Happy](https://github.com/operatehappy).

## License

Licensed under the Apache License, Version 2.0 (the "License").

You may obtain a copy of the License at [apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an _"AS IS"_ basis, without WARRANTIES or conditions of any kind, either express or implied.

See the License for the specific language governing permissions and limitations under the License.