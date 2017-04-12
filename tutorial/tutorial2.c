#include <stdio.h>
int main(int argc, char const *argv[])
{
	printf("\nIdentity Matrix:\n\n");
	int i,j;
	int count = 3;
	for (i = 0; i < count; ++i)
	{
		for (j = 0; j < count; ++j)
		{
			printf("%d\t",(int)i==j);
		}
		printf("\n");
	}
		return 0;
}